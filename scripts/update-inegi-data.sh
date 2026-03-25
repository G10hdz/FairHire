#!/bin/bash
#
# update-inegi-data.sh
# --------------------
# Script para actualizar datos de benchmarks salariales de INEGI ENOE
# 
# USO:
#   ./scripts/update-inegi-data.sh [--trimestre YYYY-TN]
#
# EJEMPLOS:
#   ./scripts/update-inegi-data.sh                    # Usa el trimestre más reciente
#   ./scripts/update-inegi-data.sh --trimestre 2024-T4
#
# REQUISITOS:
#   - Python 3.8+ con pandas instalado
#   - El script process_enoe.py debe existir en la raíz del proyecto
#

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_ROOT/netlify/functions/data"
OUTPUT_FILE="$DATA_DIR/salary_benchmarks.json"
PROCESOR_SCRIPT="$PROJECT_ROOT/process_enoe.py"

# Parsear argumentos
TRIMESTRE=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --trimestre)
      TRIMESTRE="$2"
      shift 2
      ;;
    -h|--help)
      echo "Uso: $0 [--trimestre YYYY-TN]"
      echo ""
      echo "Opciones:"
      echo "  --trimestre  Especificar trimestre (ej: 2024-T4)"
      echo "  -h, --help   Mostrar esta ayuda"
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Opción desconocida: $1${NC}"
      exit 1
      ;;
  esac
done

# Función para imprimir mensajes
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar dependencias
check_dependencies() {
  log_info "Verificando dependencias..."
  
  if ! command -v python3 &> /dev/null; then
    log_error "Python 3 no está instalado"
    exit 1
  fi
  
  if ! python3 -c "import pandas" &> /dev/null; then
    log_error "pandas no está instalado. Ejecuta: pip install pandas"
    exit 1
  fi
  
  if [ ! -f "$PROCESOR_SCRIPT" ]; then
    log_error "El script process_enoe.py no existe en $PROCESOR_SCRIPT"
    exit 1
  fi
  
  log_success "Dependencias verificadas"
}

# Crear directorio de datos si no existe
setup_data_dir() {
  if [ ! -d "$DATA_DIR" ]; then
    log_info "Creando directorio de datos: $DATA_DIR"
    mkdir -p "$DATA_DIR"
  fi
}

# Detectar automáticamente el trimestre más reciente
detect_latest_trimestre() {
  log_info "Detectando trimestre más reciente de ENOE..."
  
  # ENOE publica trimestres en formato YYYY-TN donde N=1,2,3,4
  # Obtenemos el año actual y el trimestre actual aproximado
  CURRENT_YEAR=$(date +%Y)
  CURRENT_MONTH=$(date +%m)
  
  # Determinar trimestre basado en mes actual
  if [ "$CURRENT_MONTH" -le 3 ]; then
    CURRENT_TRIMESTRE="T1"
  elif [ "$CURRENT_MONTH" -le 6 ]; then
    CURRENT_TRIMESTRE="T2"
  elif [ "$CURRENT_MONTH" -le 9 ]; then
    CURRENT_TRIMESTRE="T3"
  else
    CURRENT_TRIMESTRE="T4"
  fi
  
  # Por defecto, usar el trimestre anterior (los datos suelen publicarse con 1 trimestre de retraso)
  PREV_YEAR=$CURRENT_YEAR
  PREV_TRIMESTRE_NUM=$((${CURRENT_TRIMESTRE:1} - 1))
  
  if [ "$PREV_TRIMESTRE_NUM" -lt 1 ]; then
    PREV_YEAR=$((CURRENT_YEAR - 1))
    PREV_TRIMESTRE_NUM=4
  fi
  
  DETECTED_TRIMESTRE="${PREV_YEAR}-${CURRENT_TRIMESTRE}"
  
  if [ -z "$TRIMESTRE" ]; then
    TRIMESTRE="$DETECTED_TRIMESTRE"
    log_info "Trimestre detectado: $TRIMESTRE"
  fi
}

# Descargar archivos ENOE
download_enoe_data() {
  local trimestre=$1
  local year=${trimestre%-T*}
  local trim_num=${trimestre#*-T}
  
  # Convertir T1->1, T2->2, etc. para el nombre del archivo
  local file_trim=$trim_num
  
  log_info "Descargando datos ENOE $trimestre..."
  
  # URLs de INEGI para microdatos ENOE
  # Nota: Las URLs reales pueden cambiar, verificar en https://www.inegi.org.mx/programas/enoe/15ymas/#microdatos
  local base_url="https://www.inegi.org.mx/contenidos/programas/enoe/15ymas/microdatos/trimestral/${year}/ENOE_${year}${file_trim}MT.zip"
  
  local download_dir=$(mktemp -d)
  local zip_file="$download_dir/enoe_${trimestre}.zip"
  
  log_info "URL de descarga: $base_url"
  
  # Intentar descargar
  if command -v wget &> /dev/null; then
    wget -q --show-progress -O "$zip_file" "$base_url" 2>/dev/null || {
      log_warning "No se pudo descargar automáticamente. Descarga manual requerida."
      echo ""
      echo "Instrucciones:"
      echo "1. Ve a: https://www.inegi.org.mx/programas/enoe/15ymas/#microdatos"
      echo "2. Descarga el ZIP del trimestre $trimestre"
      echo "3. Extrae los archivos SDEMT${year}${file_trim}MT.csv y COE1T${year}${file_trim}MT.csv"
      echo "4. Ejecuta: python3 process_enoe.py --sdemt SDEMT${year}${file_trim}MT.csv --coe COE1T${year}${file_trim}MT.csv --trimestre $trimestre"
      echo ""
      rm -rf "$download_dir"
      return 1
    }
  elif command -v curl &> /dev/null; then
    curl -L -o "$zip_file" "$base_url" 2>/dev/null || {
      log_warning "No se pudo descargar automáticamente. Descarga manual requerida."
      rm -rf "$download_dir"
      return 1
    }
  else
    log_error "Ni wget ni curl están disponibles"
    rm -rf "$download_dir"
    return 1
  fi
  
  log_success "Descarga completada"
  
  # Extraer ZIP
  log_info "Extrayendo archivos..."
  unzip -q "$zip_file" -d "$download_dir"
  
  # Buscar archivos SDEMT y COE1T
  local sdemt_file=$(find "$download_dir" -name "SDEMT${year}${file_trim}*.csv" -type f | head -n 1)
  local coe_file=$(find "$download_dir" -name "COE1T${year}${file_trim}*.csv" -type f | head -n 1)
  
  if [ -z "$sdemt_file" ] || [ -z "$coe_file" ]; then
    log_error "No se encontraron los archivos SDEMT o COE1T en el ZIP"
    log_info "Contenido del ZIP:"
    unzip -l "$zip_file"
    rm -rf "$download_dir"
    return 1
  fi
  
  log_success "Archivos encontrados:"
  echo "  SDEMT: $sdemt_file"
  echo "  COE1T: $coe_file"
  
  # Ejecutar script de procesamiento
  log_info "Procesando datos con process_enoe.py..."
  python3 "$PROCESOR_SCRIPT" \
    --sdemt "$sdemt_file" \
    --coe "$coe_file" \
    --out "$OUTPUT_FILE" \
    --trimestre "$trimestre"
  
  # Limpiar
  rm -rf "$download_dir"
  
  if [ -f "$OUTPUT_FILE" ]; then
    log_success "Datos procesados exitosamente"
    return 0
  else
    log_error "El archivo de salida no se generó"
    return 1
  fi
}

# Verificar que el archivo se generó correctamente
verify_output() {
  if [ ! -f "$OUTPUT_FILE" ]; then
    log_error "El archivo $OUTPUT_FILE no existe"
    exit 1
  fi
  
  # Verificar que sea JSON válido
  if ! python3 -c "import json; json.load(open('$OUTPUT_FILE'))" &> /dev/null; then
    log_error "El archivo generado no es JSON válido"
    exit 1
  fi
  
  log_success "Archivo verificado: $OUTPUT_FILE"
  
  # Mostrar resumen
  echo ""
  log_info "Resumen de datos:"
  python3 -c "
import json
with open('$OUTPUT_FILE') as f:
  data = json.load(f)
  print(f\"  Fuente: {data['fuente']}\")
  print(f\"  Trimestre: {data['trimestre']}\")
  print(f\"  Brecha nacional: {data['datos']['nacional']['brecha_pct']}%\")
  print(f\"  Salario promedio mujeres: \${data['datos']['nacional']['mujer']:,.0f} MXN\")
  print(f\"  Salario promedio hombres: \${data['datos']['nacional']['hombre']:,.0f} MXN\")
"
}

# Commit automático (opcional)
auto_commit() {
  if command -v git &> /dev/null && [ -d "$PROJECT_ROOT/.git" ]; then
    log_info "Preparando commit automático..."
    
    cd "$PROJECT_ROOT"
    
    # Verificar si hay cambios
    if git diff --quiet "$OUTPUT_FILE"; then
      log_warning "No hay cambios en el archivo de datos"
      return 0
    fi
    
    # Obtener trimestre del archivo
    local trimestre=$(python3 -c "import json; print(json.load(open('$OUTPUT_FILE'))['trimestre'])")
    
    git add "$OUTPUT_FILE"
    git commit -m "chore: actualizar benchmarks INEGI $trimestre" || {
      log_warning "No se pudo hacer commit (quizás no hay cambios staged)"
      return 0
    }
    
    log_success "Commit creado: 'chore: actualizar benchmarks INEGI $trimestre'"
  fi
}

# Main
main() {
  echo "========================================"
  echo "  Actualización de Datos INEGI ENOE"
  echo "========================================"
  echo ""
  
  check_dependencies
  setup_data_dir
  detect_latest_trimestre
  
  echo ""
  log_info "Iniciando procesamiento para: $TRIMESTRE"
  echo ""
  
  if download_enoe_data "$TRIMESTRE"; then
    verify_output
    auto_commit
    
    echo ""
    log_success "¡Actualización completada exitosamente!"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Verifica los datos en: $OUTPUT_FILE"
    echo "  2. Ejecuta tests: npm test"
    echo "  3. Despliega: netlify deploy"
    echo ""
  else
    log_error "La actualización falló"
    exit 1
  fi
}

main "$@"

# 🌍 Plataforma WebGIS Sísmica Multimodelo

Plataforma de Análisis Espacio-Temporal y Narrativo de datos sísmicos, basada 100% en tecnologías open source.

## 📦 Instalación

```bash
# Clonar o extraer los archivos
cd webgis-sismico

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir en navegador: http://localhost:3000
```

## 🎯 Funcionalidades

### 1. Modo Global
- Mapa mundial con terremotos en tiempo real
- Datos de la API USGS
- Filtros por magnitud y fecha

### 2. Modelos Sísmicos (Pestaña "Models")

#### **Buffer Spatial**
- Fórmula: `R = 10^(0.5*M - 1.5) km`
- Muestra zonas de afectación en el mapa
- Ajustable con multiplicador

#### **Omori Temporal**
- Fórmula: `n(t) = K/(c+t)^p`
- Gráfico de decaimiento de réplicas
- Parámetros ajustables (K, c, p)

#### **ETAS Model** ⭐ NUEVO
- Fórmula: `λ(t,x,y) = μ + Σ[K·e^(αM)]/[(t+c)^p · (r²+d)^q]`
- Panel informativo con parámetros del modelo
- Gráfico de tasa de actividad vs distancia
- Seleccione un terremoto M≥5 para ver el análisis

### 3. Modo Perú
- Zonificación sísmica (Costa, Sierra, Selva)
- Eventos históricos (1746-2021)

### 4. Story Mode
- Narrativa de terremotos históricos
- Auto-play disponible

## 🔧 Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| Next.js 15 | Framework web |
| React 18 | UI |
| Leaflet.js | Mapas |
| Chart.js | Gráficos |
| Turf.js | Análisis espacial |
| TypeScript | Tipado |

## 📊 Cómo usar los Modelos

1. Haz clic en la pestaña **"Models"**
2. Selecciona un modelo (Buffer, Omori, ETAS)
3. Para Buffer: activa "Buffer Zones" en Layers
4. Para Omori/ETAS: haz clic en un terremoto del mapa

## 📁 Estructura

```
src/
├── app/
│   ├── page.tsx           # Interfaz principal
│   └── api/               # Endpoints REST
├── components/Map/        # Componentes del mapa
├── lib/                   # Modelos y datos
└── types/                 # Tipos TypeScript
```

## 🇵🇪 Datos de Perú

- Zonas sísmicas oficiales
- 7 eventos históricos documentados
- Estadísticas por departamento

---

*Plataforma desarrollada para Tesis de Maestría en TIG*
# Repositorio-prueba

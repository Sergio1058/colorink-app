# ColorInk — Plan de Diseño de Interfaz Móvil

## Concepto Visual

Aplicación de colorear dibujos vectorizados para adultos, inspirada en el estilo de Takashi Murakami: líneas negras limpias y expresivas sobre fondo blanco, con zonas cerradas que invitan al color. La UI debe sentirse como un cuaderno de arte premium: minimalista, elegante, con toques de color vibrante que recuerdan a la paleta pop de Murakami.

---

## Paleta de Colores de la App

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `primary` | `#FF3366` | `#FF3366` | Acento principal, botones CTA |
| `background` | `#FAFAF8` | `#111110` | Fondo de pantallas |
| `surface` | `#FFFFFF` | `#1C1C1A` | Tarjetas, lienzo |
| `foreground` | `#1A1A18` | `#F0EFE8` | Texto principal |
| `muted` | `#8A8A80` | `#6A6A60` | Texto secundario |
| `border` | `#E8E8E0` | `#2A2A28` | Bordes sutiles |
| `canvas` | `#FFFFFF` | `#FFFFFF` | Siempre blanco (lienzo) |
| `ink` | `#0D0D0D` | `#0D0D0D` | Líneas de contorno (siempre negro) |

---

## Pantallas de la Aplicación

### 1. Splash / Portada (`/`)
- **Contenido**: Imagen de portada configurable (por defecto: ilustración estilo Murakami), logo "ColorInk", tagline
- **Funcionalidad**: Transición animada al Home; el artista puede cambiar la imagen de portada desde ajustes
- **Layout**: Full-screen, imagen ocupa todo el fondo, overlay sutil con logo centrado

### 2. Galería / Home (`/(tabs)/index`)
- **Contenido**: Grid de tarjetas con los dibujos disponibles para colorear; cada tarjeta muestra miniatura, título y progreso de coloreado
- **Funcionalidad**: Tap en tarjeta → pantalla de coloreo; botón "+" para añadir nuevo dibujo (solo admin)
- **Layout**: FlatList en grid 2 columnas, header con logo y botón de ajustes

### 3. Pantalla de Coloreo (`/color/[id]`)
- **Contenido**: Canvas con el dibujo vectorizado, barra de herramientas inferior, selector de color
- **Funcionalidad**:
  - Relleno por flood-fill (toca zona → se colorea)
  - Repintado: tocar zona ya coloreada la repinta con el color activo
  - El contorno negro siempre se preserva (threshold de detección de línea)
  - Zoom/pan con gestos (pinch to zoom, drag)
  - Deshacer/rehacer (hasta 20 pasos)
  - Guardar progreso automáticamente
- **Layout**: Canvas ocupa 70% superior, toolbar fija en la parte inferior

### 4. Selector de Color (Bottom Sheet)
- **Contenido**:
  - Paletas clásicas: 36 colores predefinidos organizados por familia
  - Selector arcoíris: rueda de color HSV interactiva
  - Colores recientes (últimos 8 usados)
  - Cuentagotas (eyedropper) para tomar color del lienzo
- **Layout**: Bottom sheet deslizable, 3 tabs (Paleta / Arcoíris / Recientes)

### 5. Galería de Obras Completadas (`/(tabs)/gallery`)
- **Contenido**: Obras coloreadas por el usuario, con fecha y opción de compartir
- **Funcionalidad**: Ver en pantalla completa, compartir en redes, descargar como imagen
- **Layout**: Masonry grid, cada item con overlay de acciones

### 6. Ajustes (`/(tabs)/settings`)
- **Contenido**: Cambiar imagen de portada, modo oscuro/claro, info de la app, créditos
- **Funcionalidad**: Picker de imagen para portada, toggle de tema
- **Layout**: Lista de secciones estilo iOS Settings

### 7. Pantalla de Detalle / Compartir (`/share/[id]`)
- **Contenido**: Vista previa de la obra completada, opciones de compartir
- **Funcionalidad**: Compartir en Instagram, guardar en carrete, copiar enlace
- **Layout**: Full-screen con overlay de controles

---

## Flujos Principales de Usuario

### Flujo de Colorear
1. Home → tap en dibujo → Pantalla de Coloreo
2. Seleccionar color (paleta clásica o rueda arcoíris)
3. Tocar zona del dibujo → flood-fill con color elegido
4. Cambiar color y retocar zonas
5. Progreso guardado automáticamente
6. Botón "Completar" → vista previa → Galería de Obras

### Flujo de Cambio de Portada (Admin)
1. Ajustes → "Cambiar imagen de portada"
2. Selector de imagen del dispositivo
3. Previsualización → Confirmar → Portada actualizada

### Flujo de Compartir Obra
1. Galería de Obras → tap en obra → Pantalla Detalle
2. Botón Compartir → Sheet con opciones
3. Instagram / Guardar / Copiar

---

## Sistema de Publicidad (Monetización)

- **Banner Ad**: Barra fija en la parte inferior de la Galería/Home (no interfiere con el coloreo)
- **Interstitial Ad**: Aparece al completar una obra (no más de 1 vez cada 3 obras)
- **Rewarded Ad**: "Ver anuncio para desbloquear paleta premium" — paletas especiales (metálicos, neones, pasteles)
- **Implementación**: Simulada con componentes placeholder (preparada para AdMob real)

---

## Funcionalidades Extra Propuestas

1. **Modo Zen**: Temporizador y música ambiental mientras coloreas (pantalla sin distracciones)
2. **Desafío Diario**: Un dibujo nuevo cada día con contador regresivo
3. **Paletas Temáticas Desbloqueables**: Murakami Pop, Japonés Tradicional, Neon Tokyo, Pastel Dreams
4. **Compartir Proceso**: Timelapse automático del proceso de coloreado (para redes sociales)
5. **Estadísticas**: Tiempo total coloreando, obras completadas, color favorito

---

## Tipografía

- **Display**: Sistema SF Pro Display (iOS) / Roboto (Android) — bold para títulos
- **Body**: Sistema SF Pro Text — regular para cuerpo
- **Accent**: Monoespaciado para números y contadores

---

## Iconografía

Estilo: SF Symbols (iOS) / Material Icons (Android) — línea fina, minimalista, coherente con la estética del contorno del dibujo.

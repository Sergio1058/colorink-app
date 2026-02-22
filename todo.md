# ColorInk — TODO

## Setup y Configuración
- [x] Actualizar theme.config.js con paleta de colores de ColorInk
- [x] Actualizar app.config.ts con nombre y branding
- [x] Generar logo e icono de la app estilo Murakami
- [x] Configurar iconos en icon-symbol.tsx

## Pantallas Principales
- [x] Home / Galería de dibujos (grid 2 columnas)
- [x] Pantalla de Coloreo con canvas interactivo
- [x] Galería de obras completadas
- [x] Pantalla de Ajustes

## Motor de Coloreo (Core)
- [x] Implementar flood-fill en canvas (relleno por zonas)
- [x] Preservar contorno negro al colorear (threshold de línea)
- [x] Repintado de zonas ya coloreadas
- [x] Zoom y pan con gestos (pinch to zoom)
- [x] Deshacer / Rehacer (hasta 20 pasos)
- [x] Guardado automático del progreso
- [x] Lógica de dibujos reutilizables (borrar progreso al completar)

## Selector de Color
- [x] Paleta clásica (36 colores predefinidos por familia)
- [x] Selector arcoíris (rueda HSV interactiva)
- [x] Colores recientes (últimos 8)
- [ ] Cuentagotas (eyedropper)
- [x] Bottom sheet deslizable con 3 tabs

## Gestión de Imágenes
- [x] Cargar dibujos SVG/PNG como lienzo
- [x] Cambio de imagen de portada (admin)
- [x] Dibujos de muestra incluidos en la app (estilo Murakami)
- [x] Miniatura de progreso en tarjetas de galería

## Funcionalidades Extra
- [x] Modo Zen (temporizador + pantalla limpia)
- [x] Desafío Diario (dibujo nuevo cada día)
- [x] Paletas temáticas desbloqueables
- [ ] Compartir obra (Instagram, guardar, copiar)
- [x] Estadísticas de uso

## Publicidad / Monetización
- [x] Banner Ad en Home/Galería
- [x] Interstitial Ad al completar obra
- [x] Rewarded Ad para desbloquear paletas premium
- [x] Componentes placeholder preparados para AdMob

## Pulido Visual
- [x] Animaciones de transición entre pantallas
- [x] Feedback háptico en acciones principales
- [x] Modo oscuro / claro
- [x] Splash screen personalizado

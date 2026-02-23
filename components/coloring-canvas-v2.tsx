import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { WebView } from "react-native-webview";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  imageSource: { uri: string } | number;
  activeColor: string;
}

export const ColoringCanvasV2 = forwardRef((props: Props, ref) => {
  const webViewRef = useRef<WebView>(null);

  // Convertimos la imagen a una URL que el WebView entienda
  const imageUrl = typeof props.imageSource === 'number' 
    ? Image.resolveAssetSource(props.imageSource).uri 
    : props.imageSource.uri;

  // Este es el "motor" de Paint en JavaScript puro
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body { margin: 0; padding: 0; overflow: hidden; background: #fff; }
          canvas { width: 100vw; height: 100vh; object-fit: contain; }
        </style>
      </head>
      <body>
        <canvas id="paintCanvas"></canvas>
        <script>
          const canvas = document.getElementById('paintCanvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          const img = new Image();
          img.src = "${imageUrl}";
          img.crossOrigin = "Anonymous";

          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
          };

          function getPixel(imageData, x, y) {
            const index = (y * imageData.width + x) * 4;
            return [
              imageData.data[index],
              imageData.data[index + 1],
              imageData.data[index + 2],
              imageData.data[index + 3]
            ];
          }

          function floodFill(startX, startY, fillColor) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const width = imageData.width;
            const height = imageData.height;
            const targetColor = getPixel(imageData, startX, startY);
            
            // Si tocamos algo que ya es del color o es muy oscuro (línea negra), no hacemos nada
            if (isBlack(targetColor) || colorsMatch(targetColor, fillColor)) return;

            const stack = [[startX, startY]];
            while (stack.length > 0) {
              const [x, y] = stack.pop();
              const index = (y * width + x) * 4;

              if (x >= 0 && x < width && y >= 0 && y < height && 
                  colorsMatch(getPixel(imageData, x, y), targetColor)) {
                
                imageData.data[index] = fillColor[0];
                imageData.data[index + 1] = fillColor[1];
                imageData.data[index + 2] = fillColor[2];
                imageData.data[index + 3] = 255;

                stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
              }
            }
            ctx.putImageData(imageData, 0, 0);
          }

          function isBlack(color) {
            return color[0] < 50 && color[1] < 50 && color[2] < 50;
          }

          function colorsMatch(c1, c2) {
            return Math.abs(c1[0] - c2[0]) < 20 && Math.abs(c1[1] - c2[1]) < 20 && Math.abs(c1[2] - c2[2]) < 20;
          }

          canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = Math.floor((e.clientX - rect.left) * scaleX);
            const y = Math.floor((e.clientY - rect.top) * scaleY);
            
            // Color activo (convertir hex a RGB)
            const color = hexToRgb("${props.activeColor}");
            floodFill(x, y, color);
          });

          function hexToRgb(hex) {
            const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
            return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0,0,0];
          }
        </script>
      </body>
    </html>
  `;

  useImperativeHandle(ref, () => ({
    reset: () => webViewRef.current?.reload(),
  }));

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        scrollEnabled={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1, width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.4 }
});

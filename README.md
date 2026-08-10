# Solicitud de brief · Mercadotecnia YAAVS

Formulario de una página + resultados en vivo + Google Sheets.

## Arrancar

```bash
cd "/Users/LBARRADAS/Desktop/Formularios Yaavs/Formulario 5"
npm install
npm start
```

- Formulario: http://localhost:3000  
- Resultados en vivo: http://localhost:3000/resultados  
- Export CSV: http://localhost:3000/api/export.csv  

## Conectar Google Sheets

1. Crea una hoja nueva: https://sheets.new  
   Nombre sugerido: **Brief Mercadotecnia YAAVS — Respuestas**
2. Extensiones → **Apps Script** → pega el contenido de `gas/Code.gs` → Guardar  
3. Ejecuta `setupSheet` una vez (autoriza permisos)  
4. **Implementar → Nueva implementación → Aplicación web**  
   - Ejecutar como: Yo  
   - Quién tiene acceso: Cualquiera  
5. Copia la URL del despliegue y define en el entorno:

```bash
export SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/XXXX/exec"
npm start
```

En Hostinger, agrega `SHEETS_WEBHOOK_URL` como variable de entorno.

Cada envío del formulario se guarda en el servidor (para `/resultados`) y también se reenvía a la hoja.

POS & E-COMERCE HIBRIDO

sistema de comercio electronico y punto de venta (POS) desarrollado con React, TypeScript y Vite, conectado a una API construida con NestJS.

-aplicación desplegada

Frontend: https://proyecto-final-frontend-nine.vercel.app/
Backend API: https://pos-ecommerce-hibrido.onrender.com
Documentacion API (Swagger):https://pos-ecommerce-hibrido.onrender.com/docs

tecnologias

react
typeScript
vite
tailwind CSS
react Router
zustand
axios
react Hook Form
zod

requisitos

Node.js
npm
acceso a internet para conectarse al backend desplegado

Instalación y ejecución de manera local

1.- clonar el repositorio:
git clone https://github.com/adanbnjm/proyecto-final-frontend.git

2.- entrar en la carpeta:

cd proyecto-final-frontend

3.- instalar dependencias:

npm install

4.- crear un archivo .env en la raiz del proyecto con esta variable:

VITE_API_URL=https://pos-ecommerce-hibrido.onrender.com

5.- iniciar el servidor de desarrollo:

npm run dev

6.- abrir la direccion local que muestra Vite, normalmente http://localhost:5173

comandos disponibles

Comandos

npm run dev: inicia el entorno de desarrollo
npm run build: verifica typeScript

cuentas de demostracion

cuentas para probar los roles del sistema:

rol: Administrador correo: admin@pos.local contraseña: 12345678
rol: Cajero correo: cajero@pos.local contraseña: 12345678
rol: Cliente correo: cliente@pos.local contraseña: 12345678

funcionalidades principales

administracion de productos e inventario
punto de venta (POS)
carrito de compras y tienda online
gestión de pedidos
control de acceso segun roles
apertura y cierre de caja
conciliacion de caja

despliegue

el frontend esta desplegado en Vercel y utiliza la API desplegada en Render

la variable de entorno VITE_API_URL debe configurarse en Vercel con el valor:
VITE_API_URL=https://pos-ecommerce-hibrido.onrender.com

el archivo .env local no debe subirse al repositorio OJOOOOO

# Social Network Frontend

Una aplicación de red social construida con Angular 19, que se conecta a un backend de microservicios.

## 🏗️ Tecnologías

- **Angular 19** - Framework principal
- **TypeScript** - Lenguaje de programación
- **RxJS** - Programación reactiva
- **Angular Material** - Componentes UI (opcional)
- **Angular Signals** - Estado reactivo

## 📋 Prerrequisitos

- Node.js 18 o superior
- npm 9 o superior
- Angular CLI 19
- Backend de microservicios ejecutándose

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/AFGod-coder/social-network-frontend.git
cd social-network-frontend
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias
npm install

# Si hay problemas con versiones, hacer limpieza completa
rm -rf node_modules package-lock.json
npm install
```

### 3. Configurar Variables de Entorno

Crear un archivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8084/api/v1/bff'
};
```

### 4. Verificar que el Backend esté Ejecutándose

Asegúrate de que el backend esté corriendo en:
- **BFF Service**: http://localhost:8084

### 5. Ejecutar la Aplicación

```bash
# Ejecutar en modo desarrollo
ng serve

# O especificar puerto
ng serve --port 4200

# La aplicación estará disponible en http://localhost:4200
```

## 🧪 Probar la Aplicación

### 1. Usuarios de Prueba

- **Usuario Admin**: 
  - Email: admin@example.com
  - Password: admin123

### 2. Funcionalidades Disponibles

#### Autenticación
- ✅ **Login** - Iniciar sesión con email y contraseña
- ✅ **Registro** - Crear nueva cuenta
- ✅ **Logout** - Cerrar sesión
- ✅ **Persistencia de sesión** - Mantiene la sesión al recargar

#### Posts
- ✅ **Feed de usuario** - Muestra posts de otros usuarios
- ✅ **Crear posts** - Publicar nuevos mensajes
- ✅ **Ver posts** - Lista de publicaciones
- ✅ **Likes** - Dar like a posts (funcional)
- ⚠️ **Dislikes** - Quitar likes (en desarrollo)

#### Perfil
- ✅ **Ver perfil** - Información del usuario
- ✅ **Posts del usuario** - Ver propias publicaciones

## 🔧 Desarrollo

### Estructura del Proyecto

```
src/
├── app/
│   ├── components/          # Componentes de la aplicación
│   │   ├── login/          # Componente de login
│   │   ├── register/       # Componente de registro
│   │   ├── posts/          # Componente de posts y feed
│   │   ├── profile/        # Componente de perfil
│   │   └── notifications/  # Componente de notificaciones
│   ├── services/           # Servicios de la aplicación
│   │   ├── auth.service.ts # Servicio de autenticación
│   │   ├── post.service.ts # Servicio de posts
│   │   └── ...
│   ├── models/             # Modelos de datos
│   ├── guards/             # Guards de rutas
│   ├── interceptors/       # Interceptores HTTP
│   └── app.routes.ts       # Configuración de rutas
├── environments/           # Configuraciones de entorno
└── styles.css             # Estilos globales
```

### Comandos Útiles

```bash
# Generar nuevo componente
ng generate component components/nombre-componente

# Generar nuevo servicio
ng generate service services/nombre-servicio

# Construir para producción
ng build --configuration production

# Ejecutar tests
ng test

# Linting
ng lint

# Verificar configuración
ng config
```

### Configuración de Desarrollo

#### Proxy para Desarrollo

Si necesitas configurar un proxy para evitar problemas de CORS, crear `proxy.conf.json`:

```json
{
  "/api/*": {
    "target": "http://localhost:8084",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Y ejecutar con:
```bash
ng serve --proxy-config proxy.conf.json
```

## 🐛 Solución de Problemas

### Error de Dependencias

Si hay problemas con versiones de Angular:

```bash
# Verificar versiones
ng version

# Limpiar caché
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error de CORS

Si encuentras errores de CORS:

1. **Verificar que el backend esté ejecutándose**
2. **Verificar la URL del backend** en `environment.ts`
3. **Usar proxy** si es necesario

### Error de Autenticación

Si hay problemas con la autenticación:

1. **Verificar tokens** en localStorage del navegador
2. **Revisar logs** del backend
3. **Verificar que el interceptor** esté funcionando

### Error 502 Bad Gateway

Si el frontend recibe errores 502:

1. **Verificar que el backend esté ejecutándose**
2. **Revisar logs** del backend
3. **Verificar conectividad** entre servicios

## 📊 Monitoreo y Debugging

### Herramientas de Desarrollo

- **Angular DevTools** - Extensión del navegador
- **Redux DevTools** - Para estado de la aplicación
- **Network Tab** - Para ver peticiones HTTP

### Logs de Debugging

La aplicación incluye logging detallado:

```typescript
// En la consola del navegador verás:
🚀 PostsComponent - ngOnInit called
🔄 Loading feed for user: 2
✅ Feed loaded successfully: 3 posts
```

### Verificar Estado de la Aplicación

```typescript
// En la consola del navegador:
// Verificar usuario actual
console.log('Current user:', authService.currentUser);

// Verificar posts cargados
console.log('Posts:', postsComponent.posts());
```

## 🔐 Seguridad

- **JWT Tokens** - Almacenados en localStorage
- **Interceptores HTTP** - Agregan automáticamente tokens
- **Guards de rutas** - Protegen rutas privadas
- **Validación de formularios** - En el frontend

## 🚀 Despliegue

### Construcción para Producción

```bash
# Construir para producción
ng build --configuration production

# Los archivos estarán en dist/social-network/
```

### Variables de Entorno para Producción

Crear `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend.com/api/v1/bff'
};
```

## 📝 Notas de Desarrollo

### Estado de Funcionalidades

- ✅ **Login/Register** - Completamente funcional
- ✅ **Feed de usuario** - Muestra posts de otros usuarios
- ✅ **Crear posts** - Funcional
- ✅ **Likes** - Funcional
- ⚠️ **Dislikes** - Implementado pero con errores 502
- ✅ **Persistencia de sesión** - Funcional
- ✅ **Manejo de errores** - Implementado

### Próximas Mejoras

- [ ] Corregir endpoint DELETE para dislikes
- [ ] Implementar notificaciones en tiempo real
- [ ] Agregar búsqueda de usuarios
- [ ] Implementar comentarios en posts
- [ ] Agregar subida de imágenes

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
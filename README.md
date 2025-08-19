# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

-   [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
-   [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## En que nos quedamos el 6 de junio

Estamos en la creación de strings de movimientos para el historial. Hoy terminamos el caso de los caballos y torres, específicamente llegamos hasta recibir los movimientos en común de cada uno.

Solo metimos esto en possibleMovement en la función "handlePieceClick" en el if que revisamos los possibleMovements.

Lo que sigue específicamente es revisar si las piezas tienen en común la x o la y antes de hacer el movimiento y revisar si se hizo un movimiento en común.

Lo que seguiría después sería ahora si con todas los parámetros en la función "getMovementString", ahora si sacar el string de movimiento y agregarlo al historial.

### Pasos generales:

-   LocalStorage (o SessiónStorage) **Estamos aquí**

    -   Leer si hay datos guardados (cuando cargue la página de board) -> useEffect

    -   Guardado automático **Ya quedó**

-   Conversión de peones
-   Implementación de IA

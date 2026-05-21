import axios from 'axios';

//Creamos un  cliente de azios configurado con :
// -baseURL: La url de la API,tomando de las variables de entorno de EXPO
//-headers: indicar que el contenido sera json
export const client = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    headers: {'Content-Type': 'application/json'},
});
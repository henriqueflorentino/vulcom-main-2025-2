import dotenv from 'dotenv'
dotenv.config() // Carrega as variáveis de ambiente do arquivo .env

import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

const app = express()

import cors from 'cors'

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}))


app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())

// Rate limiter: limita a quantidade de requisições que cada usuário/IP
// pode efetuar dentro de um determinado intervalo de tempo
import { rateLimit } from 'express-rate-limit'


const limiter = rateLimit({
 windowMs: 60 * 1000,    // Intervalo: 1 minuto
 limit: 20               // Máximo de 20 requisições
})

/*
Vulnerabilidade: API4:2023 - Consumo irrestrito de recursos
Esta vulnerabilidade foi evitada no código ao implementar o middleware express-rate-limit, 
que restringe o número de requisições por IP (20 por minuto), protegendo a API contra 
ataques de Negação de Serviço (DoS) e força bruta. Com essa implementação que fizemos no
dia 29/10 o back-end passou a retornar o erro HTTP 429: Too Many Requests, 
indicando que aquela tentativa de ataque de força bruta sequer chegou a ser processada, fazendo com que 
o atacante perca tempo enviando várias senhas que não serão testadas.
*/
app.use(limiter)


/*********** ROTAS DA API **************/

// Middleware de verificação do token de autorização
import auth from './middleware/auth.js'
app.use(auth)


import carsRouter from './routes/cars.js'
app.use('/cars', carsRouter)

import customersRouter from './routes/customers.js'
app.use('/customers', customersRouter)

import usersRouter from './routes/users.js'
app.use('/users', usersRouter)

export default app

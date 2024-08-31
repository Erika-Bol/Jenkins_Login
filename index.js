const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

// Configuración de Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'mi-secreto',
  resave: false,
  saveUninitialized: true,
}));

// Simulación de base de datos
const users = [];

// Rutas
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.send(`<h1>Bienvenido ${req.session.username}!</h1><a href="/logout">Cerrar sesión</a>`);
  } else {
    res.send('<h1>Por favor, inicie sesión o regístrese</h1><a href="/login">Iniciar sesión</a> | <a href="/register">Registrarse</a>');
  }
});

app.get('/login', (req, res) => {
  res.send(`
    <h1>Iniciar Sesión</h1>
    <form method="post" action="/login">
      <input type="text" name="username" placeholder="Nombre de usuario" required /><br>
      <input type="password" name="password" placeholder="Contraseña" required /><br>
      <button type="submit">Iniciar sesión</button>
    </form>
  `);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user.id;
    req.session.username = user.username;
    res.redirect('/');
  } else {
    res.send('Usuario o contraseña incorrectos');
  }
});

app.get('/register', (req, res) => {
  res.send(`
    <h1>Registrarse</h1>
    <form method="post" action="/register">
      <input type="text" name="username" placeholder="Nombre de usuario" required /><br>
      <input type="password" name="password" placeholder="Contraseña" required /><br>
      <button type="submit">Registrarse</button>
    </form>
  `);
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = { id: Date.now(), username, password: hashedPassword };
  users.push(user);

  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Iniciar el Servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

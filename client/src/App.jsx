import { useState } from 'react'


import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

//Componet Imports
import Register from "./components/Register.jsx";
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';




function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <Navbar />*/}
      {/*  <Register/>*/}
      {/*  <Login />*/}
       <Dashboard/>
    {/*  <h1>Vite + React</h1>*/}
      
    </>
  )
}

export default App

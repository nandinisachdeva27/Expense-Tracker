import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Expenses from './Expenses';
import CreateExpense from './CreateExpense';
import UpdateExpense from './UpdateExpense';
function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path='/expense' element={<Expenses />} />
          <Route path='/create' element={<CreateExpense />}></Route>
          <Route path='/update/:id' element={<UpdateExpense />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
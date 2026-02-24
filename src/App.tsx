import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CardapioHome from './pages/CardapioHome';
import OrderSuccess from './pages/OrderSuccess';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CardapioHome />} />
                <Route path="/success" element={<OrderSuccess />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

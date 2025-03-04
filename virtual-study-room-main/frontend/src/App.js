// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <Header />
      <div className="container">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/room/:id" component={Room} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </Router>
  );
}

export default App;


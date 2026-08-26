import React from 'react';
import {BrowserRouter as Router,Routes,Route,useLocation,
} from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Page1 from './components/Page1';
import Page2 from './components/Page2';
import Footer from './components/Footer';
import AgentDashboard from './components/Dashboards/Agent/AgentDashboard';

import UserDashboard from './components/Dashboards/User/UserDashBoard';
import WriteComplaint from './components/WriteComplaint';
import ComplaintDetails from './components/ComplaintDetails';
import ComplaintListByStatus from './components/ComplaintListByStatus';


function MainLayout() {
  const location = useLocation();
  const hideLayoutRoutes = ['/login', '/register'];
  const isLayoutVisible = !hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      {isLayoutVisible && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/UserDashboard" element={<UserDashboard />} />
        <Route path='/AgentDashboard' element={<AgentDashboard/>}/>
        <Route path="/write" element={<WriteComplaint />} />
       

        <Route path="/complaint/:id" element={<ComplaintDetails />} />
        <Route path="/complaints/:status" element={<ComplaintListByStatus />} />

        <Route
          path="/"
          element={
            <>
              <Banner />
              <Page1 />
              <Page2 />
              <Footer />
            </>
          }
        />
        <Route path="*" element={<div className="text-center mt-10">Page Not Found</div>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;

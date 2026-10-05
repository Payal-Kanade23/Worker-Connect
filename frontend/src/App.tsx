import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './feature/LoginPage/Pages/Login'
import { Toaster } from 'react-hot-toast'
import Register from './feature/RegisterPage/Page/Register'
import ChooseRolePage from './feature/RegisterPage/Page/ChooseRole'
import WorkerDashboard from './feature/Dashboard/Pages/WorkerDashboard'
import WorkerProfile from './feature/Dashboard/Pages/WorkerProfile'
import { useLocation } from 'react-router-dom'
import Layout from './ui/Layout'
import BookRequest from './feature/BookRequest/pages/BookRequest'
import AllRequest from './feature/BookRequest/pages/AllRequest'
import LoadProfile from './feature/ProfilePage/Page/LoadProfile'
import ChekedRequest from './feature/CheckList/Pages/ChekedRequest'
import AdminLogin from './feature/Admin/pages/AdminLogin'
import LoginFirst from './ui/LoginFirst'
import { ProtectedRoute } from './ui/ProtectedRoute'
import AdminLogs from './feature/Admin/pages/AdminLog'
import EditProfile from './feature/ProfilePage/Page/EditProfile'
import Notification from './feature/Notification'
function AppContent(){
  const location = useLocation();
const hideNavbar = location.pathname === "/login" || location.pathname === "/register"

  return(
  
    <>

     
     {!hideNavbar && <Layout/>}

     <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/admin/login" element={<AdminLogin/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/choose-role" element={<ChooseRolePage/>}/>
                  <Route path="/unauthorized" element={<LoginFirst/>}/>

      <Route element={<ProtectedRoute/>}>
      <Route path="/dashboard" element={<WorkerDashboard/>}/>
      <Route path="/view/user/:userId" element={<WorkerProfile />}/>
      <Route path="/book/worker/:workerId" element={<BookRequest />}/>
      <Route path="/book/request" element={<AllRequest/>}/>
      <Route path="/profile" element={<LoadProfile/>}/>
      <Route path="/profile/edit" element={<EditProfile/>}/>
      <Route path="/booked/request" element={<ChekedRequest/>} />
      <Route path="/audit" element={<AdminLogs/>} />
      <Route path="/payment/notification" element={<Notification/>}/>


      
      </Route>
      

     </Routes>

      
    </>
    
  )
}
function App() {
  

 
  return (
    <>
 <BrowserRouter>
  <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
     <AppContent/>
     </BrowserRouter>
    
    </>
  )
}

export default App

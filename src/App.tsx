import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import APIProvider from './contexts/apiContext';

const LoginPage = lazy(() => import("./pages/login"));
const SignupPage = lazy(() => import("./pages/signup"));
const ForgotPasswordPage = lazy(() => import("./pages/forgotPassword"));
const HomePage = lazy(() => import("./pages/home"));
const ChannelPage = lazy(() => import("./pages/channel"));

function Layout() {
  return (
    <div className="h-[100vh]">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel maxSize={40} minSize={12} className="p-3">Sidebar</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function App() {
  const router = createBrowserRouter([
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/signup',
      element: <SignupPage />
    },
    {
      path: '/forgotpassword',
      element: <ForgotPasswordPage />
    },
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: '/', element: <Navigate to="/home" /> },
        { path: '/home', element: <HomePage /> },
        { path: '/channel', element: <ChannelPage /> }
      ]
    }
  ]);

  return (
    <APIProvider>
      <Suspense>
        <RouterProvider router={router} />
      </Suspense>
    </APIProvider>
  );
}

export default App
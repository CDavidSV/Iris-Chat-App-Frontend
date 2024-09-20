import { lazy, ReactNode, Suspense } from 'react';
import { createBrowserRouter, Navigate, NavLink, Outlet, RouterProvider } from 'react-router-dom';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import APIProvider, { useAuth, useUser } from './contexts/apiContext';
import { UserRound } from 'lucide-react';
import PageLoader from './components/custom/pageLoader';
import { Button } from '@/components/ui/button';
import { Search, Plus, Settings } from 'lucide-react';
import { ThemeProvider } from './contexts/themeContext';
import { ChatProvider } from './contexts/chatContext';
import { Toaster } from './components/ui/sonner';

const LoginPage = lazy(() => import("./pages/login"));
const SignupPage = lazy(() => import("./pages/signup"));
const ForgotPasswordPage = lazy(() => import("./pages/forgotPassword"));
const HomePage = lazy(() => import("./pages/home"));
const ChannelPage = lazy(() => import("./pages/channel"));
const FriendsPage = lazy(() => import("./pages/friends"));

function ProtectedRoute({ children } : { children: ReactNode }) {
  const { loggedIn } = useAuth();

  return (
    <>
      {loggedIn ? children : <Navigate to={'/login'} />}
    </>
  );
}

function Layout() {
  const { user } = useUser();

  const pages: { icon: ReactNode, label: string, path: string }[] = [
    {
      label: "Friends",
      icon: <UserRound />,
      path: "/friends"
    }
  ];

  return (
    <div className="h-[100vh]">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel className="min-w-[290px]" maxSize={40} minSize={12} defaultSize={13}>
          <div className="h-full flex flex-col justify-between">

            <div>
                <div className="border-b py-4 px-3">
                  <Button variant="secondary" className="w-full h-8 rounded-md justify-between text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0">Find a channel...<Search size={18} /></Button>
                </div>
              <div className="px-3">
                <div className="flex flex-col gap-2 mt-5 mb-6">
                  {pages.map((item, index) => (
                      <NavLink key={index} to={item.path} 
                      className={({ isActive }) => `flex flex-row items-center gap-2 p-2 rounded-md text-muted-foreground text-sm hover:bg-muted transition-all duration-75 ease-in-out ${isActive && "bg-muted text-primary"}`}>
                          {item.icon}
                          <span>{item.label}</span>
                      </NavLink>
                  ))}
                </div>
              </div>

              <div className="px-3">
                  <div className="mb-2 flex justify-between">
                    <p className="text-xs text-muted-foreground font-medium">DIRECT MESSAGES</p>
                    <Plus className="text-muted-foreground" size={18} />
                  </div>
                  <div>
                    
                  </div>
              </div>
            </div>

            <div className="p-3 border-t flex justify-between items-center">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={user?.profilePictureURL} />
                    <AvatarFallback>V</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-sm font-medium">{user?.displayName || user?.username || "Username"}</p>
                    <p className="text-xs text-muted-foreground">Status</p>
                  </div>
                </div>
                <div>
                  <Settings className="duration-0 hover:transition hover:ease-in-out hover:duration-1000 hover:rotate-180 cursor-pointer" />
                </div>
            </div>

          </div>
        </ResizablePanel>
        <ResizableHandle />
        <Suspense fallback={<PageLoader />}>        
          <ResizablePanel>
            <Outlet />
          </ResizablePanel>
        </Suspense>
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
      element: <ProtectedRoute><Layout /></ProtectedRoute>,
      children: [
        { path: '/', element: <Navigate to="/home" /> },
        { path: '/home', element: <HomePage /> },
        { path: '/channel', element: <ChannelPage /> },
        { path: '/friends', element: <FriendsPage /> }
      ]
    }
  ]);

  return (
    <ThemeProvider>
    <APIProvider>
    <ChatProvider>

      <Suspense>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </Suspense>
    
    </ChatProvider>
    </APIProvider>
    </ThemeProvider>
  );
}

export default App
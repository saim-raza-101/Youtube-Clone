import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const { addNotification } = useUI();
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const refreshToken = searchParams.get('refreshToken');
    let cancelled = false;

    // #region agent log
    fetch('http://127.0.0.1:7378/ingest/242d3439-a918-4039-9cd4-63be8c550d3c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'192050'},body:JSON.stringify({sessionId:'192050',runId:'post-fix',hypothesisId:'K',location:'AuthCallback.jsx:effectStart',message:'AuthCallback effect start',data:{hasToken:Boolean(token),hasError:Boolean(error),hasRefresh:Boolean(refreshToken)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (error) {
      setStatus('Authentication failed');
      addNotification(error, 'error');
      const timer = setTimeout(() => {
        if (!cancelled) navigate('/login', { replace: true });
      }, 2000);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    if (!token) {
      setStatus('Invalid callback');
      const timer = setTimeout(() => {
        if (!cancelled) navigate('/login', { replace: true });
      }, 2000);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    (async () => {
      try {
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // #region agent log
        fetch('http://127.0.0.1:7378/ingest/242d3439-a918-4039-9cd4-63be8c550d3c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'192050'},body:JSON.stringify({sessionId:'192050',runId:'post-fix',hypothesisId:'K',location:'AuthCallback.jsx:beforeLogin',message:'Calling loginWithToken',data:{cancelled},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        const result = await loginWithToken(token);

        // #region agent log
        fetch('http://127.0.0.1:7378/ingest/242d3439-a918-4039-9cd4-63be8c550d3c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'192050'},body:JSON.stringify({sessionId:'192050',runId:'post-fix',hypothesisId:'K',location:'AuthCallback.jsx:afterLogin',message:'loginWithToken finished',data:{cancelled,success:Boolean(result?.success),error:result?.error||null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        if (cancelled) return;

        if (result?.success) {
          setStatus('Redirecting...');
          navigate('/', { replace: true });
        } else {
          setStatus('Authentication failed');
          addNotification(result?.error || 'Failed to sign in', 'error');
          navigate('/login', { replace: true });
        }
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7378/ingest/242d3439-a918-4039-9cd4-63be8c550d3c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'192050'},body:JSON.stringify({sessionId:'192050',runId:'post-fix',hypothesisId:'H',location:'AuthCallback.jsx:catch',message:'AuthCallback threw',data:{cancelled,message:err?.message||null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (cancelled) return;
        setStatus('Authentication failed');
        addNotification(err?.message || 'Failed to sign in', 'error');
        navigate('/login', { replace: true });
      }
    })();

    return () => {
      // #region agent log
      fetch('http://127.0.0.1:7378/ingest/242d3439-a918-4039-9cd4-63be8c550d3c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'192050'},body:JSON.stringify({sessionId:'192050',runId:'post-fix',hypothesisId:'K',location:'AuthCallback.jsx:cleanup',message:'AuthCallback effect cleanup (StrictMode remount ok)',data:{},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      cancelled = true;
    };
  }, [searchParams, navigate, addNotification, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text-primary">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8"
      >
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Vidora" className="h-12 w-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          {status}
        </h2>
        <p className="text-text-secondary">
          Please wait while we complete your authentication
        </p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
        </div>
      </motion.div>
    </div>
  );
};

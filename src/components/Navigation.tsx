
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/dashboard',
      description: 'Vista general con estadísticas y últimos procesos'
    },
    { 
      id: 'registro', 
      label: 'Registro', 
      path: '/formularios',
      description: 'Tabla completa de todos los formularios guardados'
    },
    { 
      id: 'nuevo', 
      label: 'Nuevo Formulario', 
      path: '/',
      description: 'Formulario de levantamiento de proceso'
    }
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path === '/formularios' && location.pathname === '/formularios') return true;
    if (path === '/' && location.pathname === '/') return true;
    return false;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex-shrink-0">
            <h1 className="text-white text-xl font-semibold">
              Sistema de Levantamiento de Procesos
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="flex space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => navigate(item.path)}
                variant="ghost"
                className={`
                  px-6 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${isActiveRoute(item.path)
                    ? 'bg-white bg-opacity-20 text-white border-b-2 border-white'
                    : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                  }
                `}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

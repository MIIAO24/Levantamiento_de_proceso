
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { BarChart, TrendingUp, FileText, Clock, Plus, Eye } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  // Datos de ejemplo para las estadísticas
  const stats = {
    total: 24,
    revision: 8,
    completados: 12,
    pendientes: 4
  };

  // Últimos procesos
  const recentProcesses = [
    {
      id: '005',
      nombreProceso: 'Control de Calidad',
      solicitante: 'Patricia Silva',
      areaDepartamento: 'Calidad',
      fechaSolicitud: '2024-03-25',
      estado: 'revision'
    },
    {
      id: '004',
      nombreProceso: 'Aprobación de Compras',
      solicitante: 'Luis Fernández',
      areaDepartamento: 'Compras',
      fechaSolicitud: '2024-03-22',
      estado: 'completado'
    },
    {
      id: '003',
      nombreProceso: 'Onboarding de Empleados',
      solicitante: 'Ana Martínez',
      areaDepartamento: 'Recursos Humanos',
      fechaSolicitud: '2024-03-20',
      estado: 'pendiente'
    }
  ];

  const getStatusBadge = (estado: string) => {
    const variants = {
      completado: 'default',
      revision: 'secondary',
      pendiente: 'destructive'
    };
    
    const labels = {
      completado: 'Completado',
      revision: 'En Revisión',
      pendiente: 'Pendiente'
    };

    return (
      <Badge variant={variants[estado as keyof typeof variants] as any}>
        {labels[estado as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Vista general del sistema de levantamiento de procesos</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-700 mb-2">{stats.total}</div>
                  <div className="text-gray-600">Total de Procesos</div>
                </div>
                <FileText className="h-8 w-8 text-blue-700" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.revision}</div>
                  <div className="text-gray-600">En Revisión</div>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.completados}</div>
                  <div className="text-gray-600">Completados</div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">{stats.pendientes}</div>
                  <div className="text-gray-600">Pendientes</div>
                </div>
                <BarChart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Últimos Procesos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Últimos Procesos</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/formularios')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Todos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProcesses.map((process) => (
                  <div key={process.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold text-blue-700">{process.nombreProceso}</div>
                      <div className="text-sm text-gray-600">{process.solicitante} - {process.areaDepartamento}</div>
                      <div className="text-xs text-gray-500">{new Date(process.fechaSolicitud).toLocaleDateString('es-ES')}</div>
                    </div>
                    <div>
                      {getStatusBadge(process.estado)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Nuevo Formulario
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/formularios')}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Ver Registro Completo
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4 text-center hover:bg-gray-50 cursor-pointer">
                    <div className="text-2xl font-bold text-yellow-600">{stats.revision}</div>
                    <div className="text-sm text-gray-600">Pendientes de Revisión</div>
                  </Card>
                  
                  <Card className="p-4 text-center hover:bg-gray-50 cursor-pointer">
                    <div className="text-2xl font-bold text-green-600">{stats.completados}</div>
                    <div className="text-sm text-gray-600">Procesos Completados</div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { BarChart, TrendingUp, FileText, Clock, Plus, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { apiService, getStats, getProcessForms, ProcessFormData as ProcessForm } from '@/services/apiService';

interface ProcessStats {
  total: number;
  enRevision: number;
  completados: number;
  pendientes: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProcessStats>({
    total: 0,
    completados: 0,
    enRevision: 0,
    pendientes: 0
  });
  const [recentProcesses, setRecentProcesses] = useState<ProcessForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar estadísticas y procesos recientes en paralelo
      const [statsResponse, formsResponse] = await Promise.all([
        getStats(),
        getProcessForms()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (formsResponse.success) {
        const forms = Array.isArray(formsResponse.data) ? formsResponse.data : [];
        setRecentProcesses(forms.slice(0, 3));
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, any> = {
      'Completado': 'default',
      'En Revisión': 'secondary',
      'Pendiente': 'destructive'
    };
    
    return (
      <Badge variant={variants[estado] || 'outline'}>
        {estado || 'Sin Estado'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar datos</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.total}
                  </div>
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
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.enRevision}
                  </div>
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
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.completados}
                  </div>
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
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.pendientes}
                  </div>
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
                onClick={() => navigate('/registro')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Todos
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProcesses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay procesos registrados
                    </div>
                  ) : (
                    recentProcesses.map((process, index) => (
                      <div key={process.nombreProceso + index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-blue-700">{process.nombreProceso}</div>
                          <div className="text-sm text-gray-600">
                            {process.nombreSolicitante} - {process.areaDepartamento}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(process.fechaSolicitud)}
                          </div>
                        </div>
                        <div>
                          {getStatusBadge('En Revisión')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
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
                  onClick={() => navigate('/nuevo-formulario')}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Nuevo Formulario
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/registro')}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Ver Registro Completo
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4 text-center hover:bg-gray-50 cursor-pointer">
                    <div className="text-2xl font-bold text-yellow-600">
                      {loading ? '...' : stats.enRevision}
                    </div>
                    <div className="text-sm text-gray-600">Pendientes de Revisión</div>
                  </Card>
                  
                  <Card className="p-4 text-center hover:bg-gray-50 cursor-pointer">
                    <div className="text-2xl font-bold text-green-600">
                      {loading ? '...' : stats.completados}
                    </div>
                    <div className="text-sm text-gray-600">Procesos Completados</div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botón de actualización */}
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={loadDashboardData}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              'Actualizar Datos'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

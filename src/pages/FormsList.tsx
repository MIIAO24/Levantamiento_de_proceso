import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Eye, Edit, Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService, ProcessFormData as ProcessForm } from '@/services/apiService';

const FormsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [forms, setForms] = useState<ProcessForm[]>([]);
  const [filteredForms, setFilteredForms] = useState<ProcessForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<ProcessForm | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Estadísticas calculadas
  const stats = {
    total: forms.length,
    revision: forms.filter(f => f.estado === 'En Revisión').length,
    completados: forms.filter(f => f.estado === 'Completado').length,
    pendientes: forms.filter(f => f.estado === 'Pendiente').length
  };

  useEffect(() => {
    loadForms();
  }, []);

  // Efecto para filtrar formularios
  useEffect(() => {
    let filtered = forms;

    // Filtro de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(form => 
        form.nombreProceso?.toLowerCase().includes(search) ||
        form.nombreSolicitante?.toLowerCase().includes(search) ||
        form.areaDepartamento?.toLowerCase().includes(search)
      );
    }

    // Filtro de estado
    if (statusFilter) {
      filtered = filtered.filter(form => form.estado === statusFilter);
    }

    setFilteredForms(filtered);
  }, [forms, searchTerm, statusFilter]);

  const loadForms = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getForms({ limit: 100 });
      
      if (response.success) {
        setForms(response.data.items);
      } else {
        setError(response.message || 'Error al cargar los formularios');
      }
    } catch (err) {
      console.error('Error loading forms:', err);
      setError('Error de conexión al cargar los formularios');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, any> = {
      'Completado': 'default',
      'En Revisión': 'secondary', 
      'Pendiente': 'destructive'
    };
    
    return (
      <Badge variant={variants[estado] || 'outline'}>
        {estado}
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

  const handleView = async (id: string) => {
    try {
      const response = await apiService.getFormById(id);
      if (response.success) {
        setSelectedForm(response.data);
        setShowDetailModal(true);
      } else {
        alert('Error al cargar el formulario: ' + response.message);
      }
    } catch (error) {
      console.error('Error loading form details:', error);
      alert('Error de conexión al cargar el formulario');
    }
  };

  const handleEdit = (id: string) => {
    // Navegar a página de edición - implementar según tu routing
    console.log(`Editando formulario ${id}`);
    // navigate(`/edit-form/${id}`);
  };

  const handleDelete = (form: ProcessForm) => {
    setSelectedForm(form);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedForm) return;

    try {
      setDeleting(true);
      // Si tienes endpoint de delete en tu Lambda, úsalo aquí
      // const response = await apiService.deleteForm(selectedForm.id);
      
      // Por ahora, simular eliminación exitosa
      console.log(`Eliminando formulario ${selectedForm.id}`);
      
      // Remover de la lista local
      setForms(forms.filter(f => f.id !== selectedForm.id));
      
      setShowDeleteModal(false);
      setSelectedForm(null);
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Error al eliminar el formulario');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar formularios</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadForms} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
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
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white p-10 rounded-xl mb-8">
          <h1 className="text-3xl font-bold mb-3">Registro de Formularios de Levantamiento de Proceso</h1>
          <p className="text-lg opacity-90">Gestione y visualice todos los procesos documentados en su organización</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-700 mb-2">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.total}
              </div>
              <div className="text-gray-600">Total de Procesos</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.revision}
              </div>
              <div className="text-gray-600">En Revisión</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.completados}
              </div>
              <div className="text-gray-600">Completados</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.pendientes}
              </div>
              <div className="text-gray-600">Pendientes</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre del proceso, solicitante o área..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 items-center">
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="Completado">Completado</option>
                  <option value="En Revisión">En Revisión</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
                
                <Button 
                  variant="outline"
                  onClick={loadForms}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre del Proceso</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Área/Departamento</TableHead>
                  <TableHead>Fecha de Solicitud</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {forms.length === 0 ? 'No hay formularios registrados' : 'No se encontraron formularios con los filtros aplicados'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredForms.map((form, index) => (
                    <TableRow key={form.id} className="hover:bg-gray-50">
                      <TableCell>#{String(index + 1).padStart(3, '0')}</TableCell>
                      <TableCell className="font-semibold text-blue-700">
                        {form.nombreProceso || 'Sin nombre'}
                      </TableCell>
                      <TableCell>{form.nombreSolicitante || 'Sin solicitante'}</TableCell>
                      <TableCell>{form.areaDepartamento || 'Sin área'}</TableCell>
                      <TableCell>{getStatusBadge(form.estado)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(form.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(form.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(form)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Summary */}
        {!loading && filteredForms.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Mostrando {filteredForms.length} de {forms.length} formularios
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedForm?.nombreProceso || 'Detalle del Proceso'}</DialogTitle>
            <DialogDescription>
              Información completa del proceso registrado
            </DialogDescription>
          </DialogHeader>
          
          {selectedForm && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Solicitante:</label>
                  <p className="text-gray-900">{selectedForm.nombreSolicitante || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Área/Departamento:</label>
                  <p className="text-gray-900">{selectedForm.areaDepartamento || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Fecha de Solicitud:</label>
                  <p className="text-gray-900">{formatDate(selectedForm.fechaSolicitud || selectedForm.timestamp)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Estado:</label>
                  <div className="mt-1">{getStatusBadge(selectedForm.estado)}</div>
                </div>
              </div>

              {/* Descripción */}
              {selectedForm.descripcionGeneral && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Descripción General:</label>
                  <p className="text-gray-900 mt-1">{selectedForm.descripcionGeneral}</p>
                </div>
              )}

              {/* Objetivo */}
              {selectedForm.objetivoProceso && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Objetivo del Proceso:</label>
                  <p className="text-gray-900 mt-1">{selectedForm.objetivoProceso}</p>
                </div>
              )}

              {/* Pasos principales */}
              {selectedForm.pasosPrincipales && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Pasos Principales:</label>
                  <p className="text-gray-900 mt-1">{selectedForm.pasosPrincipales}</p>
                </div>
              )}

              {/* Responsable */}
              {selectedForm.responsableProceso && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Responsable del Proceso:</label>
                  <p className="text-gray-900 mt-1">{selectedForm.responsableProceso}</p>
                </div>
              )}

              {/* Herramientas */}
              {selectedForm.herramientas && selectedForm.herramientas.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Herramientas:</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedForm.herramientas.map((herramienta, index) => (
                      <Badge key={index} variant="outline">{herramienta}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Motivo de levantamiento */}
              {selectedForm.motivoLevantamiento && selectedForm.motivoLevantamiento.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Motivo de Levantamiento:</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedForm.motivoLevantamiento.map((motivo, index) => (
                      <Badge key={index} variant="secondary">{motivo}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Resultados esperados */}
              {selectedForm.resultadosEsperados && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Resultados Esperados:</label>
                  <p className="text-gray-900 mt-1">{selectedForm.resultadosEsperados}</p>
                </div>
              )}

              {/* Información técnica */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Información Técnica</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600">ID:</label>
                    <p className="font-mono">{selectedForm.id}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Creado:</label>
                    <p>{formatDate(selectedForm.timestamp)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Cerrar
            </Button>
            {selectedForm && (
              <Button onClick={() => handleEdit(selectedForm.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el proceso <strong>"{selectedForm?.nombreProceso}"</strong>? 
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormsList;

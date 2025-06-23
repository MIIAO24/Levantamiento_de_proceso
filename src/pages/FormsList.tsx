import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormRecord {
  id: string;
  nombreProceso: string;
  solicitante: string;
  areaDepartamento: string;
  fechaSolicitud: string;
  estado: 'completado' | 'revision' | 'pendiente';
}

const FormsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  // Datos de ejemplo
  const [forms] = useState<FormRecord[]>([
    {
      id: '001',
      nombreProceso: 'Proceso de Facturación',
      solicitante: 'María González',
      areaDepartamento: 'Finanzas',
      fechaSolicitud: '2024-03-15',
      estado: 'completado'
    },
    {
      id: '002',
      nombreProceso: 'Gestión de Inventarios',
      solicitante: 'Carlos Rodríguez',
      areaDepartamento: 'Operaciones',
      fechaSolicitud: '2024-03-18',
      estado: 'revision'
    },
    {
      id: '003',
      nombreProceso: 'Onboarding de Empleados',
      solicitante: 'Ana Martínez',
      areaDepartamento: 'Recursos Humanos',
      fechaSolicitud: '2024-03-20',
      estado: 'pendiente'
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
      id: '005',
      nombreProceso: 'Control de Calidad',
      solicitante: 'Patricia Silva',
      areaDepartamento: 'Calidad',
      fechaSolicitud: '2024-03-25',
      estado: 'revision'
    }
  ]);

  const stats = {
    total: forms.length,
    revision: forms.filter(f => f.estado === 'revision').length,
    completados: forms.filter(f => f.estado === 'completado').length,
    pendientes: forms.filter(f => f.estado === 'pendiente').length
  };

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

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.nombreProceso.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.areaDepartamento.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || form.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleView = (id: string) => {
    console.log(`Visualizando formulario ${id}`);
    // Aquí se navegaría a la vista de detalle
  };

  const handleEdit = (id: string) => {
    console.log(`Editando formulario ${id}`);
    // Aquí se navegaría a la vista de edición
  };

  const handleDelete = (id: string) => {
    setSelectedFormId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedFormId) {
      console.log(`Eliminando formulario ${selectedFormId}`);
      // Aquí se realizaría la eliminación
      setShowDeleteModal(false);
      setSelectedFormId(null);
    }
  };

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
              <div className="text-3xl font-bold text-blue-700 mb-2">{stats.total}</div>
              <div className="text-gray-600">Total de Procesos</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-700 mb-2">{stats.revision}</div>
              <div className="text-gray-600">En Revisión</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-700 mb-2">{stats.completados}</div>
              <div className="text-gray-600">Completados</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-700 mb-2">{stats.pendientes}</div>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  <option value="completado">Completado</option>
                  <option value="revision">En Revisión</option>
                  <option value="pendiente">Pendiente</option>
                </select>
                
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="">Todas las fechas</option>
                  <option value="today">Hoy</option>
                  <option value="week">Última semana</option>
                  <option value="month">Último mes</option>
                  <option value="year">Último año</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
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
              {filteredForms.map((form) => (
                <TableRow key={form.id} className="hover:bg-gray-50">
                  <TableCell>#{form.id}</TableCell>
                  <TableCell className="font-semibold text-blue-700">{form.nombreProceso}</TableCell>
                  <TableCell>{form.solicitante}</TableCell>
                  <TableCell>{form.areaDepartamento}</TableCell>
                  <TableCell>{new Date(form.fechaSolicitud).toLocaleDateString('es-ES')}</TableCell>
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
                        onClick={() => handleDelete(form.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar este formulario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormsList;

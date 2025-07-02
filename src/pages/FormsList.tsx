import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, RefreshCw, Eye, Trash2, FileText, Edit2, ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { apiService } from '@/services/apiService'

interface ProcessForm {
  id: string
  nombreProceso: string
  nombreSolicitante: string
  areaDepartamento: string
  fechaSolicitud: string
  estado: string
  timestamp: string
  createdAt: number
  // Campos adicionales que pueden venir del backend
  descripcionGeneral?: string
  objetivoProceso?: string
  pasosPrincipales?: string
  responsableProceso?: string
  participantesPrincipales?: string
  clientesBeneficiarios?: string
  reglasNegocio?: string
  casosExcepcionales?: string
  procedimientosEscalamiento?: string
  normativasRegulatorias?: string
  politicasInternas?: string
  requisitosSeguridad?: string
  auditoriasControles?: string
  kpiMetricas?: string
  objetivosCuantificables?: string
  funcionalidadesRequeridas?: string
  tipoInterfaz?: string
  integracionesRequeridas?: string
  requisitosNoFuncionales?: string
  resultadosEsperados?: string
  otroMotivoTexto?: string
  otrasHerramientas?: string
  // Campos de Información Técnica y de Sistemas
  sistemasApoyo?: string
  baseDatosInvolucrados?: string
  integracionesExistentes?: string
  origenInformacion?: string
  destinoInformacion?: string
  // Arrays
  herramientas?: string[]
  motivoLevantamiento?: string[]
  problems?: Array<{
    problema: string
    impacto: string
  }>
}

interface ApiResponse {
  success: boolean
  data: {
    items: ProcessForm[]
    total: number
    count: number
  }
  message?: string
}

const FormsList: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [forms, setForms] = useState<ProcessForm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedForm, setSelectedForm] = useState<ProcessForm | null>(null)
  const [editingForm, setEditingForm] = useState<ProcessForm | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    completados: 0,
    enRevision: 0,
    pendientes: 0
  })

  const loadForms = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Cargando formularios...')
      const response = await apiService.getForms()
      
      if (response.success && response.data) {
        console.log('✅ Formularios cargados:', response.data.items.length)
        setForms(response.data.items || [])
        
        // Calcular estadísticas
        const items = response.data.items || []
        setStats({
          total: items.length,
          completados: items.filter(item => item.estado === 'Completado').length,
          enRevision: items.filter(item => item.estado === 'En Revisión').length,
          pendientes: items.filter(item => item.estado === 'Pendiente').length
        })
      } else {
        console.error('❌ Error en respuesta:', response.message)
        setError(response.message || 'Error al cargar formularios')
      }
    } catch (err) {
      console.error('❌ Error cargando formularios:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este formulario?')) {
      return;
    }
    try {
      console.log('🗑️ Eliminando formulario:', id);
      const response = await apiService.deleteForm(id);
      if (response.success) {
        toast({
          title: 'Formulario eliminado',
          description: 'El formulario fue eliminado exitosamente.',
          duration: 3000,
        });
        // Recargar la lista desde el backend para mantener el estado sincronizado
        await loadForms();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'No se pudo eliminar el formulario',
          variant: 'destructive',
          duration: 5000,
        });
      }
    } catch (err) {
      console.error('❌ Error eliminando formulario:', err);
      toast({
        title: 'Error',
        description: 'Error al eliminar el formulario',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }

  const viewFormDetails = async (id: string) => {
    try {
      console.log('👁️ Obteniendo detalles del formulario:', id)
      const response = await apiService.getFormById(id)
      
      if (response.success && response.data) {
        console.log('✅ Detalles obtenidos:', response.data.id)
        setSelectedForm(response.data)
      } else {
        console.error('❌ Error obteniendo detalles:', response.message)
        alert('Error al obtener los detalles del formulario')
      }
    } catch (err) {
      console.error('❌ Error:', err)
      alert('Error al cargar los detalles')
    }
  }

  const handleEdit = (form: ProcessForm) => {
    console.log('🖊️ Editando formulario:', form.id)
    setSelectedForm(null)
    navigate(`/formularios/editar/${form.id}`)
  }

  const handleStatusChange = async (formId: string, newStatus: 'Completado' | 'En Revisión' | 'Pendiente') => {
    const currentForm = forms.find(f => f.id === formId)
    if (!currentForm) return
    
    // Si el estado es el mismo, no hacer nada
    if (currentForm.estado === newStatus) return
    
    try {
      setUpdatingStatus(formId)
      console.log('🔄 Cambiando estado del formulario:', { formId, from: currentForm.estado, to: newStatus })
      
      const response = await apiService.updateFormStatus(formId, newStatus)
      
      if (response.success) {
        // ⭐ ACTUALIZACIÓN INMEDIATA Y OPTIMISTA
        setForms(prevForms => 
          prevForms.map(form => 
            form.id === formId 
              ? { ...form, estado: newStatus }
              : form
          )
        )
        
        console.log('✅ Estado actualizado exitosamente:', { formId, newStatus })
        toast({
          title: "Estado actualizado",
          description: `El formulario ahora está en estado: ${newStatus}`,
          duration: 3000,
        })
        
        // ⭐ COMENTADO TEMPORALMENTE - CAUSA REVERSIÓN DEL ESTADO
        // setTimeout(async () => {
        //   try {
        //     await loadForms()
        //     console.log('🔄 Datos refrescados desde el servidor')
        //   } catch (error) {
        //     console.error('⚠️ Error refrescando datos:', error)
        //   }
        // }, 1000)
        
      } else {
        console.error('❌ Error actualizando estado:', response.message)
        toast({
          title: "Error",
          description: response.message || "No se pudo actualizar el estado",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (err) {
      console.error('❌ Error inesperado:', err)
      toast({
        title: "Error",
        description: "Error inesperado al actualizar el estado",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  useEffect(() => {
    loadForms()
  }, [])

  const filteredForms = forms.filter(form =>
    form.nombreProceso?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.nombreSolicitante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.areaDepartamento?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'En Revisión':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'Pendiente':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const StatusDropdown: React.FC<{ form: ProcessForm }> = ({ form }) => {
    const isUpdating = updatingStatus === form.id
    const estados = ['Pendiente', 'En Revisión', 'Completado'] as const
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-auto p-1 ${getEstadoBadgeColor(form.estado)} rounded-full`}
                  disabled={isUpdating}
                >
                  <Badge className={`${getEstadoBadgeColor(form.estado)} border-none cursor-pointer`}>
                    {isUpdating ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <ChevronDown className="h-3 w-3 mr-1" />
                    )}
                    {form.estado}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <div className="px-2 py-1.5 text-xs text-gray-500">
                  Cambiar estado del formulario
                </div>
                <DropdownMenuSeparator />
                {estados.map((estado) => (
                  <DropdownMenuItem
                    key={estado}
                    onClick={() => handleStatusChange(form.id, estado)}
                    className={`cursor-pointer ${form.estado === estado ? 'bg-gray-100' : ''}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          estado === 'Completado' ? 'bg-green-500' :
                          estado === 'En Revisión' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        {estado}
                      </span>
                      {form.estado === estado && <Check className="h-3 w-3" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click para cambiar el estado</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Cargando formularios...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Registro de Formularios de Levantamiento de Proceso
        </h1>
        <p className="text-gray-600">
          Gestione y visualice todos los procesos documentados en el sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Procesos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completados}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.enRevision}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pendientes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
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
        <Button 
          onClick={loadForms}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Forms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Formularios Registrados</CardTitle>
          <CardDescription>
            {filteredForms.length} de {forms.length} formularios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre del Proceso</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Estado</span>
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center space-y-2 text-gray-500">
                        <FileText className="h-8 w-8" />
                        <span>No se encontraron formularios</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredForms.map((form) => (
                    <TableRow key={form.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        #{form.id.split('_').pop()?.substring(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {form.nombreProceso || 'Sin nombre'}
                      </TableCell>
                      <TableCell>{form.nombreSolicitante || 'Sin solicitante'}</TableCell>
                      <TableCell>{form.areaDepartamento || 'Sin área'}</TableCell>
                      <TableCell>
                        {form.fechaSolicitud || 
                         (form.timestamp ? new Date(form.timestamp).toLocaleDateString() : 'Sin fecha')}
                      </TableCell>
                      <TableCell>
                        <StatusDropdown form={form} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewFormDetails(form.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(form.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
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
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalles - COMPLETAMENTE MEJORADO */}
      <Dialog open={!!selectedForm} onOpenChange={(open) => !open && setSelectedForm(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedForm?.nombreProceso || 'Sin nombre'}</DialogTitle>
            <DialogDescription>
              Información completa del proceso registrado
            </DialogDescription>
          </DialogHeader>
          
          {selectedForm && (
            <div className="space-y-6">
              {/* INFORMACIÓN GENERAL */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">📋 Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Solicitante:</label>
                    <p className="text-gray-900">{selectedForm.nombreSolicitante || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Área/Departamento:</label>
                    <p className="text-gray-900">{selectedForm.areaDepartamento || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Fecha de Solicitud:</label>
                    <p className="text-gray-900">{selectedForm.fechaSolicitud || 'No especificada'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Estado:</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedForm.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                      selectedForm.estado === 'En Revisión' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedForm.estado}
                    </span>
                  </div>
                </div>
              </div>

              {/* DESCRIPCIÓN DEL PROCESO */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">📝 Descripción del Proceso</h3>
                <div className="space-y-4">
                  <div>
                    <label className="font-medium text-gray-700">Descripción General:</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.descripcionGeneral || 'No especificada'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Objetivo del Proceso:</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.objetivoProceso || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Pasos Principales:</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.pasosPrincipales || 'No especificados'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Herramientas/Sistemas:</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedForm.herramientas && selectedForm.herramientas.length > 0 ? (
                        selectedForm.herramientas.map((herramienta: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {herramienta}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">No especificadas</span>
                      )}
                    </div>
                    {selectedForm.otrasHerramientas && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Otras herramientas:</strong> {selectedForm.otrasHerramientas}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* PARTICIPANTES Y RESPONSABLES */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">👥 Participantes y Responsables</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Responsable del Proceso:</label>
                    <p className="text-gray-900">{selectedForm.responsableProceso || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Participantes Principales:</label>
                    <p className="text-gray-900">{selectedForm.participantesPrincipales || 'No especificados'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-medium text-gray-700">Clientes/Beneficiarios:</label>
                    <p className="text-gray-900">{selectedForm.clientesBeneficiarios || 'No especificados'}</p>
                  </div>
                </div>
              </div>

              {/* REGLAS DE NEGOCIO */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">⚖️ Reglas de Negocio y Casos de Uso</h3>
                <div className="space-y-4">
                  <div>
                    <label className="font-medium text-gray-700">Reglas de Negocio Principales:</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.reglasNegocio || 'No especificadas'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-gray-700">Casos Excepcionales:</label>
                      <p className="text-gray-900">{selectedForm.casosExcepcionales || 'No especificados'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Procedimientos de Escalamiento:</label>
                      <p className="text-gray-900">{selectedForm.procedimientosEscalamiento || 'No especificados'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Normativas Regulatorias:</label>
                      <p className="text-gray-900">{selectedForm.normativasRegulatorias || 'No especificadas'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Políticas Internas:</label>
                      <p className="text-gray-900">{selectedForm.politicasInternas || 'No especificadas'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Requisitos de Seguridad:</label>
                      <p className="text-gray-900">{selectedForm.requisitosSeguridad || 'No especificados'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Auditorías y Controles:</label>
                      <p className="text-gray-900">{selectedForm.auditoriasControles || 'No especificadas'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MÉTRICAS Y OBJETIVOS */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">📊 Métricas y Objetivos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">KPI/Métricas Actuales:</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.kpiMetricas || 'No especificadas'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Objetivos Cuantificables:</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.objetivosCuantificables || 'No especificados'}</p>
                  </div>
                </div>
              </div>

              {/* PROBLEMAS Y OPORTUNIDADES */}
              {selectedForm.problems && selectedForm.problems.length > 0 && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-blue-700">⚠️ Problemas y Oportunidades</h3>
                  <div className="space-y-3">
                    {selectedForm.problems.map((problem: any, index: number) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="font-medium text-red-700">Problema Identificado:</label>
                            <p className="text-gray-900">{problem.problema || 'No especificado'}</p>
                          </div>
                          <div>
                            <label className="font-medium text-red-700">Impacto:</label>
                            <p className="text-gray-900">{problem.impacto || 'No especificado'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ESPECIFICACIONES DE LA SOLUCIÓN */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">🔧 Especificaciones de la Solución</h3>
                <div className="space-y-4">
                  <div>
                    <label className="font-medium text-gray-700">Funcionalidades Específicas Requeridas:</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.funcionalidadesRequeridas || 'No especificadas'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-gray-700">Tipo de Interfaz:</label>
                      <p className="text-gray-900">{selectedForm.tipoInterfaz || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Integraciones Requeridas:</label>
                      <p className="text-gray-900">{selectedForm.integracionesRequeridas || 'No especificadas'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Requisitos No Funcionales:</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.requisitosNoFuncionales || 'No especificados'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Motivo del Levantamiento:</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedForm.motivoLevantamiento && selectedForm.motivoLevantamiento.length > 0 ? (
                        selectedForm.motivoLevantamiento.map((motivo: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {motivo}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">No especificados</span>
                      )}
                    </div>
                    {selectedForm.otroMotivoTexto && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Otro motivo:</strong> {selectedForm.otroMotivoTexto}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Resultados Esperados:</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.resultadosEsperados || 'No especificados'}</p>
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN TÉCNICA Y DE SISTEMAS */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-700">🖥️ Información Técnica y de Sistemas</h3>
                
                {/* Arquitectura Tecnológica */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3 text-indigo-600">🏗️ Arquitectura tecnológica actual</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-gray-700">Sistemas que apoyan al proceso:</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.sistemasApoyo || 'No especificados'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Base de datos involucrados:</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.baseDatosInvolucrados || 'No especificados'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="font-medium text-gray-700">Integraciones existentes:</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.integracionesExistentes || 'No especificadas'}</p>
                  </div>
                </div>

                {/* Flujo de Datos */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3 text-indigo-600">🔄 Flujo de datos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-gray-700">Origen de la información:</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.origenInformacion || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Destino de la información:</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedForm.destinoInformacion || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                {/* Información del Sistema (ID y fecha) */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-md font-semibold mb-3 text-gray-700">🔍 Información del Sistema</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-600">ID:</label>
                      <p className="text-gray-800 font-mono">{selectedForm.id}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-600">Creado:</label>
                      <p className="text-gray-800">{new Date(selectedForm.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedForm(null)}>
              Cerrar
            </Button>
            <Button 
              onClick={() => handleEdit(selectedForm!)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FormsList
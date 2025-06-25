import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import apiService, { type ProcessForm as ProcessFormData, type ApiResponse } from '@/services/apiService';

const formSchema = z.object({
  nombreSolicitante: z.string().min(1, 'Este campo es requerido'),
  areaDepartamento: z.string().min(1, 'Este campo es requerido'),
  fechaSolicitud: z.string().min(1, 'Este campo es requerido'),
  nombreProceso: z.string().min(1, 'Este campo es requerido'),
  descripcionGeneral: z.string().min(1, 'Este campo es requerido'),
  objetivoProceso: z.string().min(1, 'Este campo es requerido'),
  pasosPrincipales: z.string().min(1, 'Este campo es requerido'),
  herramientas: z.array(z.string()).min(1, 'Seleccione al menos una herramienta'),
  otrasHerramientas: z.string().optional(),
  responsableProceso: z.string().min(1, 'Este campo es requerido'),
  participantesPrincipales: z.string().min(1, 'Este campo es requerido'),
  clientesBeneficiarios: z.string().min(1, 'Este campo es requerido'),
  reglasNegocio: z.string().min(1, 'Este campo es requerido'),
  casosExcepcionales: z.string().optional(),
  procedimientosEscalamiento: z.string().optional(),
  normativasRegulatorias: z.string().optional(),
  politicasInternas: z.string().optional(),
  requisitosSeguridad: z.string().optional(),
  auditoriasControles: z.string().optional(),
  kpiMetricas: z.string().optional(),
  objetivosCuantificables: z.string().optional(),
  funcionalidadesRequeridas: z.string().min(1, 'Este campo es requerido'),
  tipoInterfaz: z.string().min(1, 'Este campo es requerido'),
  integracionesRequeridas: z.string().optional(),
  requisitosNoFuncionales: z.string().optional(),
  motivoLevantamiento: z.array(z.string()).min(1, 'Seleccione al menos un motivo'),
  otroMotivoTexto: z.string().optional(),
  resultadosEsperados: z.string().min(1, 'Este campo es requerido'),
  sistemasApoyo: z.string().optional(),
  baseDatosInvolucrados: z.string().optional(),
  integracionesExistentes: z.string().optional(),
  origenInformacion: z.string().optional(),
  destinoInformacion: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Problem {
  id: number;
  problema: string;
  impacto: string;
}

const ProcessForm = () => {
  const [problems, setProblems] = useState<Problem[]>([{ id: 1, problema: '', impacto: '' }]);
  const [showOtherTools, setShowOtherTools] = useState(false);
  const [showOtherMotivo, setShowOtherMotivo] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedMotivos, setSelectedMotivos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fechaSolicitud: new Date().toISOString().split('T')[0],
      herramientas: [],
      motivoLevantamiento: [],
    },
  });

  const addProblem = () => {
    const newId = Math.max(...problems.map(p => p.id)) + 1;
    setProblems([...problems, { id: newId, problema: '', impacto: '' }]);
  };

  const removeProblem = (id: number) => {
    if (problems.length > 1) {
      setProblems(problems.filter(p => p.id !== id));
    }
  };

  const handleToolChange = (tool: string, checked: boolean) => {
    let newTools = [...selectedTools];
    if (checked) {
      newTools.push(tool);
    } else {
      newTools = newTools.filter(t => t !== tool);
    }
    setSelectedTools(newTools);
    form.setValue('herramientas', newTools);
    
    if (tool === 'otro') {
      setShowOtherTools(checked);
    }
  };

  const handleMotivoChange = (motivo: string, checked: boolean) => {
    let newMotivos = [...selectedMotivos];
    if (checked) {
      newMotivos.push(motivo);
    } else {
      newMotivos = newMotivos.filter(m => m !== motivo);
    }
    setSelectedMotivos(newMotivos);
    form.setValue('motivoLevantamiento', newMotivos);
    
    if (motivo === 'otroMotivo') {
      setShowOtherMotivo(checked);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Validar que los problemas tengan contenido antes de enviar
      const validProblems = problems.filter(p => p.problema.trim() !== '' || p.impacto.trim() !== '');
      
      console.log('Enviando datos:', { formData: data, problems: validProblems });
      


      const response = await apiService.createForm(data)



      if (response.success) {
        toast({
          title: "✅ Formulario enviado exitosamente",
          description: "Los datos han sido registrados correctamente en el sistema.",
          variant: "default",
        });
        
        // Opcional: resetear el formulario después del envío exitoso
        form.reset();
        setProblems([{ id: 1, problema: '', impacto: '' }]);
        setSelectedTools([]);
        setSelectedMotivos([]);
        setShowOtherTools(false);
        setShowOtherMotivo(false);
        
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      
      toast({
        title: "❌ Error al enviar formulario",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-blue-900">{title}</h2>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white p-10 rounded-t-xl text-center mb-0">
        <h1 className="text-3xl font-bold mb-3">Formulario de Levantamiento de Proceso</h1>
        <p className="text-lg opacity-90">Complete la información solicitada para documentar el proceso</p>
      </div>

      <Card className="rounded-t-none shadow-lg">
        <CardContent className="p-0">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
            
            {/* INFORMACIÓN GENERAL */}
            <div className="p-8 border-b hover:bg-gray-50 transition-colors">
              <SectionHeader icon="📋" title="INFORMACIÓN GENERAL" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nombreSolicitante">Nombre del solicitante <span className="text-red-500">*</span></Label>
                  <Input {...form.register('nombreSolicitante')} className="mt-1" disabled={isSubmitting} />
                  {form.formState.errors.nombreSolicitante && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.nombreSolicitante.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="areaDepartamento">Área/Departamento <span className="text-red-500">*</span></Label>
                  <Input {...form.register('areaDepartamento')} className="mt-1" disabled={isSubmitting} />
                  {form.formState.errors.areaDepartamento && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.areaDepartamento.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="fechaSolicitud">Fecha de solicitud <span className="text-red-500">*</span></Label>
                  <Input type="date" {...form.register('fechaSolicitud')} className="mt-1" disabled={isSubmitting} />
                  {form.formState.errors.fechaSolicitud && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.fechaSolicitud.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="nombreProceso">Nombre del proceso <span className="text-red-500">*</span></Label>
                  <Input {...form.register('nombreProceso')} className="mt-1" disabled={isSubmitting} />
                  {form.formState.errors.nombreProceso && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.nombreProceso.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* DESCRIPCIÓN DEL PROCESO */}
            <div className="p-8 border-b hover:bg-gray-50 transition-colors">
              <SectionHeader icon="📝" title="DESCRIPCIÓN DEL PROCESO" />
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="descripcionGeneral">Descripción general <span className="text-red-500">*</span></Label>
                  <Textarea 
                    {...form.register('descripcionGeneral')} 
                    placeholder="Describe qué hace el proceso, cuál es su propósito y qué resultados produce" 
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.descripcionGeneral && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.descripcionGeneral.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="objetivoProceso">Objetivo del proceso <span className="text-red-500">*</span></Label>
                  <Textarea 
                    {...form.register('objetivoProceso')} 
                    placeholder="¿Cuál es el objetivo principal que persigue el proceso?" 
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.objetivoProceso && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.objetivoProceso.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="pasosPrincipales">Pasos principales del proceso <span className="text-red-500">*</span></Label>
                  <Textarea 
                    {...form.register('pasosPrincipales')} 
                    placeholder="Describe los pasos principales actuales" 
                    rows={4} 
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.pasosPrincipales && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.pasosPrincipales.message}</p>
                  )}
                </div>
                
                <div>
                  <Label>Herramientas/Sistemas utilizados <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {[
                      { id: 'excel', label: 'Excel/Hoja de cálculo' },
                      { id: 'email', label: 'Email' },
                      { id: 'erp', label: 'Sistema ERP' },
                      { id: 'docFisico', label: 'Documento físico' },
                      { id: 'appWeb', label: 'Aplicación web' },
                      { id: 'otro', label: 'Otro' },
                    ].map((tool) => (
                      <div key={tool.id} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Checkbox
                          id={tool.id}
                          checked={selectedTools.includes(tool.id)}
                          onCheckedChange={(checked) => handleToolChange(tool.id, checked as boolean)}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor={tool.id} className="cursor-pointer">{tool.label}</Label>
                      </div>
                    ))}
                  </div>
                  {showOtherTools && (
                    <div className="mt-3">
                      <Label htmlFor="otrasHerramientas">Especifique otras herramientas:</Label>
                      <Input {...form.register('otrasHerramientas')} className="mt-1" disabled={isSubmitting} />
                    </div>
                  )}
                  {form.formState.errors.herramientas && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.herramientas.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* PARTICIPANTES Y RESPONSABLES */}
            <div className="p-8 border-b hover:bg-gray-50 transition-colors">
              <SectionHeader icon="👥" title="PARTICIPANTES Y RESPONSABLES" />
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="responsableProceso">Responsable del proceso <span className="text-red-500">*</span></Label>
                  <Input {...form.register('responsableProceso')} className="mt-1" disabled={isSubmitting} />
                  {form.formState.errors.responsableProceso && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.responsableProceso.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="participantesPrincipales">Participantes principales <span className="text-red-500">*</span></Label>
                  <Textarea 
                    {...form.register('participantesPrincipales')} 
                    placeholder="Lista de personas, roles o áreas que participan en el proceso" 
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.participantesPrincipales && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.participantesPrincipales.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="clientesBeneficiarios">Clientes/Beneficiarios <span className="text-red-500">*</span></Label>
                  <Textarea 
                    {...form.register('clientesBeneficiarios')} 
                    placeholder="¿Quiénes reciben el resultado de este proceso? (internos/externos)" 
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.clientesBeneficiarios && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.clientesBeneficiarios.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* REGLAS DE NEGOCIO Y CASOS DE USO */}
            <div className="p-8 border-b hover:bg-gray-50 transition-colors">
              <SectionHeader icon="⚖️" title="REGLAS DE NEGOCIO Y CASOS DE USO" />
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="reglasNegocio">Reglas de negocio principales <span className="text-red-500">*</span></Label>
                  <Textarea 
                    {...form.register('reglasNegocio')} 
                    placeholder="¿Qué reglas o lógica específica gobierna este proceso? (validaciones, condiciones, criterios de decisión)" 
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.reglasNegocio && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.reglasNegocio.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="casosExcepcionales">Casos excepcionales</Label>
                    <Textarea 
                      {...form.register('casosExcepcionales')} 
                      placeholder="¿Qué situaciones específicas o excepcionales puede presentar el proceso?" 
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="procedimientosEscalamiento">Procedimientos de escalamiento</Label>
                    <Textarea 
                      {...form.register('procedimientosEscalamiento')} 
                      placeholder="¿Qué se hace cuando ocurren problemas o excepciones?" 
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="normativasRegulatorias">Normativas regulatorias</Label>
                    <Textarea 
                      {...form.register('normativasRegulatorias')} 
                      placeholder="¿Qué leyes, normas o regulaciones debe cumplir el proceso?" 
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="politicasInternas">Políticas internas</Label>
                    <Textarea 
                      {...form.register('politicasInternas')} 
                      placeholder="¿Qué políticas de la organización aplican a este proceso?" 
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="requisitosSeguridad">Requisitos de seguridad</Label>
                    <Textarea 
                      {...form.register('requisitosSeguridad')} 
                      placeholder="¿Qué consideraciones de seguridad o privacidad debe cumplir?" 
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="auditoriasControles">Auditorías y controles</Label>
                    <Textarea 
                      {...form.register('auditoriasControles')} 
                      placeholder="¿Requiere auditoría o controles específicos?" 
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MÉTRICAS Y OBJETIVOS */}
            <div className="p-8 border-b hover:bg-gray-50 transition-colors">
              <SectionHeader icon="📊" title="MÉTRICAS Y OBJETIVOS" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="kpiMetricas">KPI/Métricas actuales</Label>
                  <Textarea 
                    {...form.register('kpiMetricas')} 
                    placeholder="¿Qué métricas se utilizan actualmente para medir el desempeño del proceso?" 
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <Label htmlFor="objetivosCuantificables">Objetivos cuantificables</Label>
                  <Textarea 
                    {...form.register('objetivosCuantificables')} 
                    placeholder="¿Qué metas específicas busca alcanzar con la mejora? (ej: reducir tiempo en 50%, eliminar 3 pasos manuales)" 
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* PROBLEMAS Y OPORTUNIDADES */}
            <div className="p-8 border-b hover:bg-gray-50 transition-colors">
              <SectionHeader icon="⚠️" title="PROBLEMAS Y OPORTUNIDADES" />
              
              <div className="space-y-4">
                {problems.map((problem, index) => (
                  <div key={problem.id} className="bg-gray-50 p-6 rounded-lg border relative">
                    {problems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProblem(problem.id)}
                        className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                        disabled={isSubmitting}
                      >
                        Eliminar
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Problema identificado</Label>
                        <Textarea 
                          placeholder="Describe el problema identificado" 
                          value={problem.problema}
                          onChange={(e) => {
                            const newProblems = [...problems];
                            newProblems[index].problema = e.target.value;
                            setProblems(newProblems);
                          }}
                          className="mt-1"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <Label>Impacto</Label>
                        <Textarea 
                          placeholder="¿Cómo afecta este problema? (operación, costos, tiempo, calidad)" 
                          value={problem.impacto}
                          onChange={(e) => {
                            const newProblems = [...problems];
                            newProblems[index].impacto = e.target.value;
                            setProblems(newProblems);
                          }}
                          className="mt-1"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  onClick={addProblem}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={isSubmitting}
                >
                  + Añadir otro problema
                </Button>
              </div>
            </div>

            {/* ESPECIFICACIONES DE LA SOLUCIÓN */}
            <div className="p-8 border-b hover:bg-gray-50 transition-colors">
              <SectionHeader icon="💡" title="ESPECIFICACIONES DE LA SOLUCIÓN" />
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="funcionalidadesRequeridas">Funcionalidades específicas requeridas <span className="text-red-500">*</span></Label>
                  <Textarea 
                    {...form.register('funcionalidadesRequeridas')} 
                    placeholder="¿Qué funcionalidades específicas debe tener la solución tecnológica? (ej: gestión de usuarios, reportes automatizados, notificaciones, flujos de aprobación)" 
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.funcionalidadesRequeridas && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.funcionalidadesRequeridas.message}</p>
                  )}
                </div>
                
                <div>
                  <Label>Tipo de interfaz <span className="text-red-500">*</span></Label>
                  <RadioGroup 
                    onValueChange={(value) => form.setValue('tipoInterfaz', value)}
                    className="flex flex-wrap gap-4 mt-2"
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <RadioGroupItem value="appWeb" id="appWebOption" disabled={isSubmitting} />
                      <Label htmlFor="appWebOption">Aplicación web</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <RadioGroupItem value="appMovil" id="appMovil" disabled={isSubmitting} />
                      <Label htmlFor="appMovil">Aplicación móvil</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <RadioGroupItem value="hibrido" id="hibrido" disabled={isSubmitting} />
                      <Label htmlFor="hibrido">Híbrido (web + móvil)</Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.tipoInterfaz && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.tipoInterfaz.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="integracionesRequeridas">Integraciones requeridas</Label>
                    <Textarea 
                      {...form.register('integracionesRequeridas')} 
                      placeholder="¿Con qué sistemas debe integrarse la nueva aplicación?" 
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="requisitosNoFuncionales">Requisitos no funcionales</Label>
                    <Textarea 
                      {...form.register('requisitosNoFuncionales')} 
                      placeholder="Performance, escalabilidad, usabilidad, disponibilidad, etc." 
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Motivo del levantamiento <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {[
                      { id: 'mejorarEficiencia', label: 'Mejorar eficiencia' },
                      { id: 'mejorarCalidad', label: 'Mejorar calidad' },
                      { id: 'reducirCostos', label: 'Reducir costos' },
                      { id: 'reducirTiempo', label: 'Reducir tiempo' },
                      { id: 'automatizacion', label: 'Automatización' },
                      { id: 'cumplimientoNormativo', label: 'Cumplimiento normativo' },
                      { id: 'documentacion', label: 'Documentación/Estandarización' },
                      { id: 'otroMotivo', label: 'Otro' },
                    ].map((motivo) => (
                      <div key={motivo.id} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Checkbox
                          id={motivo.id}
                          checked={selectedMotivos.includes(motivo.id)}
                          onCheckedChange={(checked) => handleMotivoChange(motivo.id, checked as boolean)}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor={motivo.id} className="cursor-pointer">{motivo.label}</Label>
                      </div>
                    ))}
                  </div>
                  {showOtherMotivo && (
                    <div className="mt-3">
                      <Label htmlFor="otroMotivoTexto">Especifique otro motivo:</Label>
                      <Input {...form.register('otroMotivoTexto')} className="mt-1" disabled={isSubmitting} />
                    </div>
                  )}
                  {form.formState.errors.motivoLevantamiento && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.motivoLevantamiento.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="resultadosEsperados">Resultados esperados <span className="text-red-500">*</span></Label>
                  <Textarea 
                    {...form.register('resultadosEsperados')} 
                    placeholder="¿Qué espera lograr con la mejora del proceso?" 
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.resultadosEsperados && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.resultadosEsperados.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* INFORMACIÓN TÉCNICA Y DE SISTEMAS */}
            <div className="p-8 hover:bg-gray-50 transition-colors">
              <SectionHeader icon="🖥️" title="INFORMACIÓN TÉCNICA Y DE SISTEMAS" />
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 pl-5 border-l-4 border-blue-500">
                    Arquitectura tecnológica actual
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="sistemasApoyo">Sistemas que apoyan al proceso</Label>
                      <Textarea 
                        {...form.register('sistemasApoyo')} 
                        placeholder="Lista de los sistemas/aplicaciones que actualmente soportan este proceso" 
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="baseDatosInvolucrados">Base de datos involucrados</Label>
                      <Textarea 
                        {...form.register('baseDatosInvolucrados')} 
                        placeholder="¿Qué base de datos o repositorios de información utiliza el proceso?" 
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="integracionesExistentes">Integraciones existentes</Label>
                      <Textarea 
                        {...form.register('integracionesExistentes')} 
                        placeholder="¿Existen conexiones/integraciones entre sistemas para este proceso?" 
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 pl-5 border-l-4 border-blue-500">
                    Flujo de datos
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="origenInformacion">Origen de la información</Label>
                      <Textarea 
                        {...form.register('origenInformacion')} 
                        placeholder="¿De dónde provienen los datos que alimentan este proceso?" 
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="destinoInformacion">Destino de la información</Label>
                      <Textarea 
                        {...form.register('destinoInformacion')} 
                        placeholder="¿A dónde va la información procesada?" 
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de envío */}
            <div className="p-8 text-center">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  'Enviar Formulario'
                )}
              </Button>
              
              {isSubmitting && (
                <p className="text-sm text-gray-600 mt-2">
                  Por favor espere mientras se procesa su solicitud...
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessForm;

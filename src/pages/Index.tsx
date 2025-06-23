
import ProcessForm from "@/components/ProcessForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { List } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-50">
        <Button 
          onClick={() => navigate('/formularios')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <List className="h-4 w-4 mr-2" />
          Ver Formularios
        </Button>
      </div>
      <ProcessForm />
    </div>
  );
};

export default Index;

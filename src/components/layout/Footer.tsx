import { Shield } from "lucide-react";

const Footer = () => (
  <footer className="gradient-hero text-navy-foreground py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-accent" />
            <span className="font-display font-bold text-lg">Moz Car History</span>
          </div>
          <p className="text-sm text-navy-foreground/60">
            Plataforma digital de registo e verificação do histórico de manutenção automóvel em Moçambique.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Plataforma</h4>
          <ul className="space-y-2 text-sm text-navy-foreground/60">
            <li>Registar Oficina</li>
            <li>Consultar Viatura</li>
            <li>Relatórios</li>
            <li>API</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Recursos</h4>
          <ul className="space-y-2 text-sm text-navy-foreground/60">
            <li>Central de Ajuda</li>
            <li>Documentação</li>
            <li>Blog</li>
            <li>Contacto</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-navy-foreground/60">
            <li>Termos de Uso</li>
            <li>Política de Privacidade</li>
            <li>Licenças</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10 pt-6 text-center text-sm text-navy-foreground/40">
        © 2026 Moz Car History. Todos os direitos reservados. Maputo, Moçambique.
      </div>
    </div>
  </footer>
);

export default Footer;

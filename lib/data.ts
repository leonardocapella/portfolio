import { siHubspot, siMeta, siGoogleads, siGoogleanalytics, siJavascript, siTypescript, siPython, siOpenjdk, siCplusplus, siPostgresql, siHtml5, siCss, siReact, siNodedotjs, siLinux, siSupabase, siGithub, type SimpleIcon } from "simple-icons";

// Só informação real (CV oficial + notas do Obsidian). Placeholders marcados com [PLACEHOLDER].
// Hub e cobrança: sem nomes de clientes nem números do negócio (contratos, MRR, equipe) até o Leonardo confirmar.

export const PROFILE = {
  name: "Leonardo Capella",
  role: "Analista de Dados & Automações",
  email: "leonardowommercapella@gmail.com",
  city: "Porto Alegre, RS",
  cv: "/assets/curriculo-leonardo-capella.pdf",
  photo: "/assets/foto-leonardo-fundo-preto.jpg", // seção Sobre
  badgePhoto: "/assets/foto-leonardo-fundo-branco.jpg", // crachá do hero
  linkedin: "https://www.linkedin.com/in/leonardo-capella-24223a392",
  github: "https://github.com/leonardocapella",
  instagram: "https://www.instagram.com/kpxlla/",
};

export type Project = {
  slug: string;
  title: string;
  tag: string;
  color: string;
  short: string;
  long: string[];
  features: string[];
  tech: string[];
  snippet: string;
  problem: string;
  solution: string;
  result: string;
  url?: string; // site público
  image?: string; // print real (substitui a demo ilustrativa)
  imageCaption?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "hub-v4",
    title: "Hub V4",
    tag: "V4 Mendes · interno",
    color: "#C6FF3D",
    short: "Painel interno da unidade que junta clientes, contratos e as horas da equipe, com Supabase por trás.",
    long: [
      "Painel interno da unidade da V4 Company onde trabalho, publicado no Cloudflare Pages e com o Supabase como backend (Postgres, RLS e Edge Functions).",
      "Escrevi a importação dos contratos: mais de cem PDFs exportados do CRM foram lidos seção por seção, e cada contrato ficou vinculado ao cliente certo. Todo SQL passa por um parser real do Postgres e por 413 checks automáticos antes de chegar ao banco.",
      "Também fiz a tela de horas e tarefas, sincronizada com a ferramenta de gestão da equipe, com abas por pessoa, por cliente e de tarefas atrasadas.",
    ],
    features: [
      "Importação de contratos em PDF com de-para por nome e CNPJ",
      "Status de clientes cruzado com as receitas",
      "Sincronização de tarefas via Edge Function, contornando o limite de paginação da API",
      "SQL idempotente: rodar duas vezes não duplica nada",
    ],
    tech: ["Supabase", "Postgres", "Python", "JavaScript", "Cloudflare Pages"],
    snippet: "100% dos contratos vinculados",
    problem: "Informações de clientes, contratos e horas da equipe espalhadas entre PDFs, planilhas e ferramentas diferentes.",
    solution: "Um painel único sobre Supabase. Os contratos em PDF são lidos por script e casados com o cliente certo por nome e CNPJ, e as tarefas da equipe chegam por uma Edge Function.",
    result: "Todos os contratos vigentes ficaram vinculados ao cliente certo. A importação passa por 413 checks antes de tocar o banco, e rodar duas vezes não duplica nada.",
  },
  {
    slug: "diagnostico-v4",
    title: "Diagnóstico de Marketing e Vendas",
    tag: "V4 Mendes · comercial",
    color: "#E5242B",
    short: "Formulário de diagnóstico em etapas que o lead responde antes da reunião, salvando o progresso no aparelho.",
    long: [
      "Ferramenta que o time comercial manda para o lead antes da primeira reunião. São 21 perguntas em 6 blocos: posicionamento, estrutura digital, mídia paga, estrutura comercial, base de clientes e prioridade.",
      "Uma pergunta por tela, navegação pelo teclado (Enter avança), progresso salvo no próprio aparelho e envio das respostas para uma planilha via Apps Script. No fim, o lead escolhe um horário livre para a reunião.",
    ],
    features: ["21 perguntas em 6 blocos, cerca de 7 minutos", "Progresso salvo no aparelho até o envio", "Respostas caem numa planilha via Apps Script", "Agendamento só com horários livres"],
    tech: ["HTML/CSS", "JavaScript", "Apps Script", "Google Sheets"],
    snippet: "01 / 17 → reunião agendada",
    problem: "As reuniões comerciais começavam do zero, gastando o primeiro encontro só com perguntas básicas sobre o negócio do lead.",
    solution: "Um diagnóstico online em etapas, com a identidade da V4, que o lead responde antes da reunião. As respostas vão direto para a planilha do time.",
    result: "O time chega na primeira reunião com o cenário do lead mapeado e o horário já agendado.",
    url: "https://leonardocapella.github.io/diagnostico-v4/",
    image: "/assets/projetos/diagnostico.jpg",
  },
  {
    slug: "cobranca",
    title: "Automação de cobrança",
    tag: "V4 Mendes · financeiro",
    color: "#7CF7E4",
    short: "Régua de cobrança de D-5 a D+26 montada a partir da planilha financeira, com a mensagem de cada vencimento já pronta.",
    long: [
      "Painel em Google Apps Script que lê a planilha financeira e monta a régua de cobrança de D-5 a D+26, com a mensagem de cada etapa já pronta para revisão.",
      "A conciliação com o sistema financeiro passou a ter uma única fonte da verdade.",
    ],
    features: ["Régua D-5 → D+26", "Mensagens geradas automaticamente", "Leitura direta da planilha financeira"],
    tech: ["Apps Script", "Google Sheets", "JavaScript"],
    snippet: "D-5 · D0 · D+3 · D+10 · D+26",
    problem: "Todo dia era preciso descobrir à mão quem cobrar, em qual etapa e com qual mensagem.",
    solution: "Um painel em Apps Script que lê a planilha financeira, encaixa cada vencimento na régua de D-5 a D+26 e gera a mensagem da etapa.",
    result: "A régua do dia sai pronta para revisão, e a conciliação passou a ter uma única fonte da verdade.",
  },
  {
    slug: "discadora",
    title: "Discadora automática",
    tag: "V4 Mendes · comercial",
    color: "#FF7A45",
    short: "Auto-dialer para o time comercial que distingue atendimento de caixa postal, com versão web para os agentes.",
    long: [
      "Discadora automática para o time comercial: liga para a lista, detecta se quem atendeu foi uma pessoa ou a caixa postal e desliga sozinha quando cai na caixa.",
      "A versão web tem uma página de agentes com instalador para os outros PCs e fica acessível de fora do escritório por Cloudflare Tunnel.",
    ],
    features: ["Detecção de caixa postal", "Painel web + instalador para agentes", "Acesso remoto por Cloudflare Tunnel"],
    tech: ["Python", "SIP / MicroSIP", "VB-Cable", "Cloudflare Tunnel"],
    snippet: "atendeu? → conecta | caixa? → desliga",
    problem: "O time comercial perdia tempo discando número por número e ouvindo caixa postal.",
    solution: "Um discador em Python sobre SIP, que reconhece quando cai na caixa postal e encerra a ligação sozinho. A versão web tem instalador para os agentes e acesso remoto por Cloudflare Tunnel.",
    result: "O agente só fala com quem atendeu, e cada PC novo entra pelo instalador da própria página.",
  },
  {
    slug: "polymarket-scanner",
    title: "Scanner Polymarket",
    tag: "Pessoal · dados",
    color: "#B69CFF",
    short: "Scanner só de leitura que pontua mercados por volume, spread e incerteza, e manda alertas. Sem carteira e sem ordens.",
    long: [
      "Scanner somente leitura em cima da Gamma API pública da Polymarket. Não usa carteira, chave nem envia ordens.",
      "As heurísticas ficam documentadas no código: volume em 24h, spread, preço longe dos extremos e movimento forte no dia. Cada mercado recebe uma nota, e uma rotina periódica manda as melhores oportunidades como alerta.",
    ],
    features: ["Score transparente e documentado", "Saída em JSON e Markdown", "Alertas periódicos"],
    tech: ["Python", "REST API", "Heurísticas"],
    snippet: "score = log10(vol24) + 10·|Δ1d| + …",
    problem: "Centenas de mercados abertos ao mesmo tempo, e é difícil achar os que têm volume real e resultado ainda incerto.",
    solution: "Um script que lê a Gamma API pública, filtra por volume, spread e preço e dá a cada mercado uma nota com fórmula documentada.",
    result: "A cada execução sai uma lista curta e explicável das melhores oportunidades, sem carteira e sem enviar nenhuma ordem.",
  },
  {
    slug: "ia-no-terminal",
    title: "IA no terminal",
    tag: "Pessoal · IA",
    color: "#FFD23F",
    short: "Claude Code ligado a um gateway local (9router), com o proxy Headroom comprimindo o contexto. O benchmark é meu.",
    long: [
      "Ambiente de agentes de código: o Claude Code aponta para um gateway local (9router), e o proxy Headroom fica no meio comprimindo o contexto antes de cada chamada.",
      "Montei um benchmark offline para medir o ganho real: logs repetitivos caíram 99,7%, JSON 30%, e código e mensagens do usuário não comprimem.",
    ],
    features: ["Comando claude-hr sobe e derruba o proxy sozinho", "Benchmark offline, sem telemetria", "Vários provedores atrás de um único endpoint"],
    tech: ["Claude Code", "9router", "Headroom", "Linux"],
    snippet: "logs −99,7% · JSON −30%",
    problem: "Sessões longas com agentes de código gastam muitos tokens com logs e JSON repetidos.",
    solution: "Um proxy local de compressão (Headroom) entre o Claude Code e o gateway 9router, ligado por um único comando, o claude-hr.",
    result: "No benchmark que fiz, logs repetitivos caíram 99,7% e JSON 30%. Código e mensagens do usuário passam intactos.",
  },
  {
    slug: "roteamento-leads",
    title: "Roteamento de leads",
    tag: "Cliente V4 · CRM",
    color: "#FF5FA2",
    short: "Cenário no Make que confere se o lead já existe no Kommo e alterna os novos entre as vendedoras.",
    long: [
      "Para a landing de captação de um cliente, montei um cenário no Make: cada lead do formulário é conferido no Kommo e, se for novo, vai para uma das vendedoras, alternando entre elas.",
    ],
    features: ["Deduplicação no CRM", "Distribuição alternada", "Planilha vinculada"],
    tech: ["Make", "Kommo CRM", "Webhooks"],
    snippet: "form → existe? → round-robin",
    problem: "Leads da landing de um cliente chegavam duplicados ao CRM e eram distribuídos à mão.",
    solution: "Um cenário no Make que confere cada lead no Kommo antes de criar e alterna os novos entre as vendedoras.",
    result: "Cada lead entra no CRM uma vez só, já com responsável definido.",
  },
  {
    slug: "ls-conceito",
    title: "LS Conceito",
    tag: "Freelance · e-commerce",
    color: "#E2B54A",
    short: "Vitrine de uma loja de moda masculina: layout próprio em HTML, fundo preto e dourado, levado para a Nuvemshop.",
    long: [
      "Site da LS Conceito, loja de moda masculina de Viamão/RS. Montei o layout em HTML, CSS e JavaScript puros e depois levei para a Nuvemshop, onde ficam produtos, estoque e pagamento.",
      "A home tem barra de avisos rotativa, banners, compra por categoria, lançamentos, faixa de marcas, catálogo com busca e filtros, e compra pelo WhatsApp já com produto e tamanho escolhidos. Os pedidos de ajuste chegavam por áudio e eram implementados em seguida.",
    ],
    features: ["Catálogo com busca, filtros e 'ver mais' no mobile", "Estoque por tamanho vindo da Nuvemshop", "Compra pelo WhatsApp com produto e tamanho", "Preço sem valor cadastrado vira 'a confirmar', nada inventado"],
    tech: ["HTML/CSS", "JavaScript", "Nuvemshop", "WebP"],
    snippet: "vitrine → WhatsApp → Nuvemshop",
    problem: "A loja vendia só pelo Instagram e precisava de uma vitrine com a cara da marca, preto e dourado, que levasse direto para a compra.",
    solution: "Layout próprio em HTML/CSS/JS com catálogo filtrável e compra pelo WhatsApp, depois levado para a Nuvemshop para carrinho e estoque.",
    result: "Vitrine completa com páginas institucionais e estoque por tamanho integrado, ajustada várias vezes a partir do feedback do dono.",
    image: "/assets/projetos/ls-conceito.jpg",
  },
  {
    slug: "joao-kirst",
    title: "Site do João Kirst",
    tag: "Freelance · portfólio",
    color: "#8B5CF6",
    short: "Portfólio de um designer gráfico com hero de nome gigante, retrato recortado e domínio próprio.",
    long: [
      "Portfólio do João Kirst, designer gráfico, publicado no GitHub Pages com domínio próprio (joaokirst.art.br).",
      "Hero com o nome em tamanho gigante e o retrato recortado na frente, galeria de projetos por categoria (social media, reels, identidade visual, impressos) e chamada direta para o WhatsApp.",
    ],
    features: ["Domínio próprio no GitHub Pages", "Galeria por categoria", "Imagem de compartilhamento personalizada", "CTA direto para o WhatsApp"],
    tech: ["HTML/CSS", "JavaScript", "GitHub Pages"],
    snippet: "joaokirst.art.br",
    problem: "Um designer com muitos trabalhos espalhados pelas redes e nenhum lugar só dele para mostrar e fechar projetos.",
    solution: "Site estático rápido com hero de impacto, galeria organizada por tipo de peça e contato pelo WhatsApp, em domínio próprio.",
    result: "Site no ar em joaokirst.art.br, com o portfólio dele organizado num link só.",
    url: "https://joaokirst.art.br/",
    image: "/assets/projetos/joao-kirst.jpg",
  },
  {
    slug: "aivio-studio",
    title: "AIVIO Studio",
    tag: "Pessoal · produto",
    color: "#6E7BFF",
    short: "Landing de um produto de agentes de IA que captam clientes para negócios locais e criam o site em um clique.",
    long: [
      "Landing de produto para a ideia de agentes de IA que encontram clientes perto de um negócio local, conversam pelo WhatsApp e geram o site da empresa.",
      "Página com seções de como funciona, captação de leads, planos e FAQ, e um mockup animado da conversa no hero.",
    ],
    features: ["Mockup animado de conversa no hero", "Seções de planos e FAQ", "Captura de leads"],
    tech: ["HTML/CSS", "JavaScript", "GitHub Pages"],
    snippet: "agentes de IA → leads locais",
    problem: "Negócios locais sem site, sem agência e sem tempo para captar clientes online.",
    solution: "A proposta de produto inteira numa landing: agentes que acham clientes na região, atendem pelo WhatsApp e criam o site em 1 clique.",
    result: "Landing publicada que apresenta a proposta e os planos.",
    url: "https://leonardocapella.github.io/site-ai-studio/",
    image: "/assets/projetos/aivio.jpg",
    imageCaption: "prévia ilustrativa",
  },
];

export const GROUPS = ["Linguagens", "Web", "Dados & Backend", "Cloud & Infra", "CRM & Marketing"] as const;
export type Tech = { id: string; label: string; group: (typeof GROUPS)[number]; icon?: SimpleIcon; text?: string; color: string; ink: string; phrase: string };

// icon = ícone do simple-icons; text = rótulo quando não há ícone (AWS e Kommo não estão no simple-icons)
export const KEYS: Tech[] = [
  { id: "js", label: "JavaScript", group: "Linguagens", icon: siJavascript, color: "#F7C21E", ink: "#111111", phrase: "Roda no navegador, no servidor e, se deixar, na geladeira. [] + {} ainda é um mistério." },
  { id: "ts", label: "TypeScript", group: "Linguagens", icon: siTypescript, color: "#3178C6", ink: "#FFFFFF", phrase: "É o JavaScript depois da terapia: agora ele avisa antes de quebrar." },
  { id: "py", label: "Python", group: "Linguagens", icon: siPython, color: "#14B8A6", ink: "#FFFFFF", phrase: "Indentação é lei. Uma planilha de mil linhas vira um script de vinte." },
  { id: "java", label: "Java", group: "Linguagens", icon: siOpenjdk, color: "#F97316", ink: "#FFFFFF", phrase: "public static void main(String[] args) só pra dizer oi. A faculdade manda lembranças." },
  { id: "cpp", label: "C++", group: "Linguagens", icon: siCplusplus, color: "#8B5CF6", ink: "#FFFFFF", phrase: "Ponteiro, memória e coragem. Segmentation fault é só um 'oi' mal dado." },
  { id: "sql", label: "SQL", group: "Dados & Backend", icon: siPostgresql, color: "#4169E1", ink: "#FFFFFF", phrase: "SELECT * FROM problemas WHERE resolvido = false; e depois um UPDATE pra virar true." },
  { id: "html", label: "HTML", group: "Web", icon: siHtml5, color: "#EF4444", ink: "#FFFFFF", phrase: "Não é linguagem de programação, mas sem ele ninguém vê nada." },
  { id: "css", label: "CSS", group: "Web", icon: siCss, color: "#A855F7", ink: "#FFFFFF", phrase: "Centralizar uma div já foi rito de passagem. Hoje é display: grid; place-items: center." },
  { id: "react", label: "React", group: "Web", icon: siReact, color: "#0EA5E9", ink: "#FFFFFF", phrase: "Tudo é componente, inclusive este teclado." },
  { id: "node", label: "Node.js", group: "Dados & Backend", icon: siNodedotjs, color: "#16A34A", ink: "#FFFFFF", phrase: "O JavaScript saiu do navegador e foi morar no servidor." },
  { id: "linux", label: "Linux", group: "Cloud & Infra", icon: siLinux, color: "#27272A", ink: "#FCC624", phrase: "sudo faz-funcionar. O terminal é minha segunda casa." },
  { id: "aws", label: "AWS (Amazon Web Services)", group: "Cloud & Infra", text: "aws", color: "#232F3E", ink: "#FFFFFF", phrase: "A nuvem da Amazon: servidor, banco e armazenamento sob demanda. É o computador de outra pessoa, só que com 200 serviços e uma fatura pra vigiar." },
  { id: "supabase", label: "Supabase", group: "Dados & Backend", icon: siSupabase, color: "#1C1C1C", ink: "#3ECF8E", phrase: "Postgres com superpoderes: auth, RLS e edge functions. O Hub da V4 roda aqui." },
  { id: "kommo", label: "Kommo CRM", group: "CRM & Marketing", text: "kommo", color: "#1D2B5B", ink: "#FFFFFF", phrase: "Funil, tag e automação: é aqui que o lead vira cliente. E é aqui que eu caço lead duplicado." },
  { id: "hubspot", label: "HubSpot", group: "CRM & Marketing", icon: siHubspot, color: "#FF7A59", ink: "#FFFFFF", phrase: "CRM com marketing junto. Se não está no CRM, a reunião não aconteceu." },
  { id: "meta", label: "Meta Ads", group: "CRM & Marketing", icon: siMeta, color: "#0467DF", ink: "#FFFFFF", phrase: "O anúncio que te seguiu do Instagram até aqui. Pixel bem instalado é metade da campanha." },
  { id: "gads", label: "Google Ads", group: "CRM & Marketing", icon: siGoogleads, color: "#4285F4", ink: "#FFFFFF", phrase: "Pagar para aparecer em primeiro e torcer para a palavra-chave não ser cara demais." },
  { id: "ga", label: "Google Analytics", group: "CRM & Marketing", icon: siGoogleanalytics, color: "#E37400", ink: "#FFFFFF", phrase: "Onde a gente descobre que o botão mais bonito era o menos clicado." },
  { id: "github", label: "GitHub", group: "Cloud & Infra", icon: siGithub, color: "#F4F4F5", ink: "#111111", phrase: "Onde o código mora e onde o 'funciona na minha máquina' é posto à prova." },
];

// Certificados: o LinkedIn não abre sem login, então só entram os que o Leonardo informar.
// Formato: { title: "Nome do curso", org: "Instituição", year: "2026", url?: "link de verificação" }
export const CERTS: { title: string; org: string; year: string; url?: string }[] = [];

// Formação e experiência (fonte: currículo oficial), mostradas na mesma aba enquanto não há certificados.
export const CREDENTIALS = [
  { kind: "Formação", title: "Bacharelado em Ciência da Computação", org: "UniRitter · Campus FAPA, Porto Alegre", when: "Em andamento" },
  { kind: "Experiência", title: "Analista de TI/CRM · Automação de Processos e IA", org: "V4 Company Mendes & Santos", when: "06/2026 · atual" },
  { kind: "Idiomas", title: "Inglês e Espanhol avançados", org: "Português nativo", when: "" },
];

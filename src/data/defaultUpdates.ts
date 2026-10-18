import { PortalUpdatePost } from '../types/fanfic';

export const INITIAL_PORTAL_UPDATES: PortalUpdatePost[] = [
  {
    id: 'update-1893',
    number: '#1893',
    title: 'Atualização #1893',
    adminAuthor: 'Joy',
    publishedDate: '12 de agosto de 2026',
    editorialText: 'Atualização de terça-feira! Se você estava ansioso pelo próximo capítulo das suas leituras favoritas, essa é a hora de correr para conferir as novidades e continuar acompanhando cada história. Desejamos uma ótima leitura e esperamos que aproveitem cada capítulo!',
    contactNote: 'Qualquer erro nessa atualização, podem me chamar no @lumierejoy',
    newStories: [
      {
        id: 'new-1',
        type: 'nova',
        fandomCategory: 'Star Wars – Em Andamento',
        title: 'A Profecia dos Amantes',
        author: 'Lumi Virtanen',
        storySlugOrId: 'a-melhor-vinganca'
      },
      {
        id: 'new-2',
        type: 'nova',
        fandomCategory: 'Restritas – Cantores – Em Andamento',
        title: 'Debi Tirar Más Fotos',
        author: 'Juliana Gonçalves',
        storySlugOrId: 'ritmo-do-coracao'
      },
      {
        id: 'new-3',
        type: 'nova',
        fandomCategory: 'Restritas – Fórmula 1 – Em Andamento',
        title: 'Moonlight & Sunrise',
        author: 'Joy',
        storySlugOrId: 'a-herdeira-sombria'
      }
    ],
    updatedStories: [
      {
        id: 'upd-1',
        type: 'atualizacao',
        fandomCategory: 'Restritas – Originais – Andamento',
        title: 'Capítulo 33 de Mason (Cave Panthers #3)',
        author: 'Mayara Gondim',
        storySlugOrId: 'a-melhor-vinganca'
      },
      {
        id: 'upd-2',
        type: 'atualizacao',
        fandomCategory: 'Originais – Em Andamento',
        title: 'Capítulo 7, 8 e 9 de Efeito Colateral',
        author: 'Flávia Coelho',
        storySlugOrId: 'ritmo-do-coracao'
      }
    ],
    announcements: [
      '– Não consegue ver a atualização? Limpe o cache (ctrl+f5 ou ⌘+f5) e tente novamente.',
      '– Participe do grupo do Lumiere.ink no Facebook: Grupo – Lumiere.ink Oficial.',
      '– Siga-nos em nossas redes sociais: Facebook | Twitter | Instagram (@lumiere.ink).',
      '– Qualquer erro nessa atualização, mande um e-mail para erros@lumiere.ink.',
      'Lembrando que a autora primeiro tem que enviar um e-mail para a sua beta relatando o erro.'
    ],
    comments: []
  },
  {
    id: 'update-1892',
    number: '#1892',
    title: 'Atualização #1892 (K-Pop & Especiais)',
    adminAuthor: 'Paloma',
    publishedDate: '23 de junho de 2026',
    editorialText: 'Especial com novos capítulos de bandas e romance de inverno! Prepare seu chá quente e venha ler suas histórias favoritas.',
    contactNote: 'Dúvidas e envio de betagem pelo canal @lumiere',
    newStories: [
      {
        id: 'new-4',
        type: 'nova',
        fandomCategory: 'K-POP – Em Andamento',
        title: 'Midnight in Seoul',
        author: 'Hana Lee',
        storySlugOrId: 'ritmo-do-coracao'
      }
    ],
    updatedStories: [
      {
        id: 'upd-3',
        type: 'atualizacao',
        fandomCategory: 'Originais – Concluída',
        title: 'Capítulo Final de A Herdeira Sombria',
        author: 'Helena Rossi',
        storySlugOrId: 'a-herdeira-sombria'
      }
    ],
    announcements: [
      '– Novas betas disponíveis na área da comunidade.',
      '– O assistente Word para HTML agora detecta nomes automaticamente!'
    ],
    comments: [
      {
        id: 'comm-1',
        authorName: 'mari 🎀',
        email: 'mari@leitoras.com',
        website: 'twitter.com/marileitora',
        message: 'Amei a atualização! Estava esperando tanto pelo capítulo novo!',
        createdAt: '23/06/2026 às 19:42'
      }
    ]
  }
];

# Repertório Musical - v1.0 Beta

Bem-vindo ao **Repertório Musical**, uma aplicação web focada no gerenciamento de repertórios de igrejas, bandas e grupos musicais. Este sistema foi desenhado para facilitar a vida tanto dos organizadores (liderança/administradores) quanto dos músicos na hora de visualizar a pauta (programação) do dia.

---

## 🎵 Sobre o Sistema

O **Repertório Musical** permite criar um banco de dados centralizado de letras e cifras. A partir dessas músicas, os administradores podem montar as **Programações (Eventos)** para cultos, ensaios ou shows, definindo a ordem das músicas, o tom e quem será o cantor/vocalista (Ministro) principal de cada canção. 

Os músicos acessam o painel de forma simples pelo celular ou computador, escolhem o evento do dia e acompanham o repertório de forma inteligente.

## 🚀 Funcionalidades Principais

1. **Gestão de Músicas (CRUD)**
   - Cadastro completo com Título, Cantor, Gênero, Letra, Cifras, Tom original e Link do YouTube.
   - Opção para definir velocidade de rolagem automática da tela.

2. **Gestão de Programações / Eventos (CRUD)**
   - Criação de Eventos com Data, Hora, Tema e Nome do culto.
   - Adição de músicas à setlist (pauta).
   - Reordenação (mover para cima/baixo) e remoção de músicas.
   - **NOVO:** Indicação do Cantor (Ministro/Vocal) para cada música diretamente na setlist.

3. **Visualização Inteligente para o Músico (SongView)**
   - O músico entra no evento e vê todas as músicas na ordem definida.
   - **Transposição Automática Inteligente:** O sistema sabe converter os acordes (inclusive bemois, menores, sustenidos, etc.) permitindo que o músico aumente ou diminua o tom na hora.
   - **Design de Alto Contraste:** O fundo das letras e notas é totalmente branco com texto escuro, melhorando drasticamente a legibilidade nos palcos (sem forçar a visão).
   - Rolagem automática da letra, para que o músico não precise usar as mãos enquanto toca.
   - Opções para Aumentar/Diminuir a fonte e deixar o texto em Negrito.

4. **Painel de Controle Flutuante e Fixação**
   - O título da música, o tom atual e os botões de controle (Tocar, Pausar, Zoom, Negrito) ficam fixos na parte inferior ou superior da tela, enquanto o músico pode arrastar a letra livremente pelo meio.
   - Botão para expandir/ocultar a área de configurações e ganhar mais espaço de tela para a leitura.

5. **Identidade Visual (UI/UX)**
   - Tema "Dark-Glassmorphism" com o uso de **Violeta** e **Laranja Neon Extremo** nos cabeçalhos e menus, criando uma estética moderna, elegante e "viva".
   - Navegação otimizada no cabeçalho com destaque visual forte (`btn-active`) para o menu atual.

## 🔒 Segurança e Acesso
- Toda a área de configuração (`/admin` e `/eventos-admin`) é protegida por senha. 
- Usuários comuns/músicos têm acesso apenas de leitura através do menu "Página Principal" e "Letras".

## 🛠️ Tecnologias Utilizadas
- **Frontend:** React.js, Vite, React Router DOM, Lucide-React (Ícones).
- **Estilização:** CSS puro (Vanilla) com variáveis responsivas (Custom Properties), animações e efeitos Glassmorphism.
- **Backend / Database:** Firebase (Firestore) como Banco de Dados NoSQL em tempo real.
- **Hospedagem:** GitHub Pages.

---

## 🏷️ Versão 1.0 Beta
Esta versão marca a consolidação das rotinas de **CRUD** completas para músicas e eventos, a integração da leitura fluida com transposição inteligente de acordes (incluindo tratamento de notas menores e acidentes bemol/sustenido), além do encerramento da implementação estética (Visual Dark + Neon).

**Data da Release:** Setembro de 2026.

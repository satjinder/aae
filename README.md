# Banking Industry Architecture Network (BIAN) Visualization Tool

> **⚠️ Work in Progress:** This project is currently under active development. Features, documentation, and functionality may change frequently. Feedback is welcome!

## Overview
This project serves two primary objectives:
1. Exploration of AI capabilities in visualizing and understanding complex architectural patterns
2. Demonstration of BIAN (Banking Industry Architecture Network) concepts and their practical application in banking systems

The tool embodies the concept of "Architecture as Enablement" - empowering various roles within the organization to understand, interact with, and propose changes to the architecture. It bridges the gap between architectural constructs and practical implementation by:

- Enabling architects to define and maintain architectural constructs
- Allowing business analysts, developers, and other stakeholders to understand current architecture
- Facilitating the proposal of architectural changes by any team member
- Supporting architects and solution designers in reviewing proposed changes
- Providing a common language for discussing architectural decisions

The visualization demonstrates how BIAN's conceptual model maps to real-world banking systems and teams, effectively illustrating Conway's Law in action. It provides an interactive way to understand the relationships between:
- BIAN service domains and capabilities
- Actual banking systems and applications
- Organizational team structures
- System interactions and dependencies

## Architecture as Enablement
This project promotes a modern approach to enterprise architecture where:

### For Architects
- Define and maintain architectural constructs using BIAN framework
- Create clear visualization of architectural decisions
- Review and validate proposed changes
- Ensure alignment with enterprise standards

### For Other Roles
- Understand current architecture through interactive visualization
- Propose changes with clear context and impact
- Collaborate with architects on architectural decisions
- Learn architectural patterns through practical examples

### Key Benefits
- Democratized access to architectural knowledge
- Reduced communication barriers between teams
- Faster feedback loops for architectural changes
- Better alignment between business and technical teams
- Improved understanding of system dependencies

## Live Demo
The application is deployed and available at: [https://satjinder.github.io/aae/](https://satjinder.github.io/aae/)

## Key Features
- Interactive visualization of BIAN service domains
- Mapping of conceptual models to real systems
- Team structure visualization
- System dependency mapping
- AI-powered insights and analysis, including gap analysis (e.g., identifying missing features like crypto currency support in service domains)
- Client-side only application with BYOK (Bring Your Own Key) mode

## AI Integration
The application operates in BYOK (Bring Your Own Key) mode:
- Users can provide their own OpenAI API key
- The key is stored securely in the browser's local storage
- All AI operations are performed client-side
- No server-side storage or processing of API keys

## Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **UI Components**: Material-UI (MUI)
- **Visualization**: ReactFlow with ELK.js for graph layout
- **AI Integration**: LangChain with OpenAI
- **Build Tool**: Vite
- **Development**: TypeScript, ESLint
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites
- Node.js (Latest LTS version recommended)
- npm or yarn package manager
- OpenAI API key (for AI features)

### Installation
1. Clone the repository:
```bash
git clone [repository-url]
cd architecture-viewer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Using AI Features
1. Visit the deployed application at [https://satjinder.github.io/aae/](https://satjinder.github.io/aae/)
2. Provide your OpenAI API key when prompted
3. The key will be stored in your browser's local storage
4. You can now use all AI-powered features of the application

## Project Structure
```
src/
├── components/     # React components
├── models/        # Data models and types
├── services/      # Business logic and API services
└── utils/         # Utility functions
```

## Diagrams

### Main Architecture Diagram
The interactive visualization board allows users to search and filter components using keywords. This enables quick navigation through the complex BIAN service domains and their relationships. Users can dynamically bring relevant items onto the board for detailed analysis.

![Main Architecture Diagram](assets/diagram.png)

### AI Agent Features
The AI-powered agent enhances the exploration experience by understanding natural language queries. It intelligently identifies relevant node types and relationships based on user input, making it easier to navigate the complex architecture.

![Agent Search by Name and Type](assets/agent%20searching%20node%20by%20name%20and%20type.png)

The agent can provide deeper insights into the relationships between services and teams. When users ask about service ownership or team responsibilities, the agent understands the underlying connections and can reveal indirect relationships. For example, it can identify which teams are responsible for implementing specific service domains, even when these relationships aren't directly visible in the initial view.

![Agent Search Related Team to Service](assets/agent%20search%20related%20team%20to%20the%20service%20on%20the%20diagram.png)

### Gap Analysis: LLM Response to Crypto Currency Support
![Gap Analysis](assets/gap_analysis.png)
*Placeholder: Example LLM response when asked about crypto currency support in the Payment Execution service domain, showing architectural gaps or missing features.*

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
[Add your license information here]

## Acknowledgments
- BIAN (Banking Industry Architecture Network) for their architectural framework
- The open-source community for the amazing tools and libraries used in this project

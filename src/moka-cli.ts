#!/usr/bin/env node

const HELP_TEXT: string = `
☕ Bem-vindo ao MokaCode!

   Você está na cafeteria de código do Machi. Pegue uma xícara e vamos programar!

   Uso:
     moka-code [comando] [opções]

   Nosso cardápio de comandos especiais:

   - moka-install [blend] <nome-do-projeto>: Serve um "Café Quentinho" (cria um projeto Godot a partir dos templates Platformer, TopDown, ou BodyLess).
   - moka-rename: Dá uma "mexida" nos nomes de arquivos e pastas, deixando tudo padronizado e com aroma de código limpo.
   - moka-extensions: Gerencia a instalação de extensões de terceiros para o Gemini CLI.

   Para um mergulho mais fundo em cada comando, use: <comando> --help
   Exemplo: moka-install --help
`;

function main(): void {
    const args: string[] = process.argv.slice(2);

    const isHelpCommand: boolean = args.some(arg => arg.startsWith('--help'));

    if (isHelpCommand || args.length === 0) { // Show help if no arguments or --help
        console.log(HELP_TEXT);
        return;
    }

    // If not a help command, we should probably route to other commands
    // For now, just log a message or exit
    console.log("Comando não reconhecido. Use 'moka-code --help' para ver as opções.");
    process.exit(1);
}

main();

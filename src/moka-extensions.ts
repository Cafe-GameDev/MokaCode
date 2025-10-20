#!/usr/bin/env bun

import { execSync } from 'child_process';

const EXTENSION_REPOS: { name: string, url: string }[] = [
    { name: 'github', url: 'https://github.com/github/github-mcp-server' },
    { name: 'context7', url: 'https://github.com/upstash/context7' },
    { name: 'nanobanana', url: 'https://github.com/gemini-cli-extensions/nanobanana' },
    { name: 'huggingface', url: 'https://github.com/huggingface/hf-mcp-server' },
    { name: 'jules', url: 'https://github.com/gemini-cli-extensions/jules' },
    { name: 'gemini-docs-ext', url: 'https://github.com/markmcd/gemini-docs-ext' },
    { name: 'computer-use', url: 'https://github.com/automateyournetwork/GeminiCLI_ComputerUse_Extension' }
];

function printUsage(): void {
    console.log(`
☕ Uso: moka-extensions install

   Este comando instala as extensões recomendadas para o Gemini CLI.
   Ele garante que você tenha todas as ferramentas necessárias para uma experiência completa.

Comandos:
  install: Instala as extensões de terceiros listadas.

Exemplos:
  moka-extensions install
    `);
    process.exit(0);
}

function runCommand(command: string): void {
    try {
        // Attempt to pipe 'yes' to bypass interactive prompts
        execSync(`echo y | ${command}`, { stdio: 'inherit' });
    } catch (error) {
        console.error(`\nFalha ao executar o comando: ${command}`);
        // Do not throw error here, allow other extensions to attempt installation
    }
}

async function main(): Promise<void> {
    const args: string[] = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        printUsage();
    }

    const command = args[0];

    switch (command) {
        case 'install':
            console.log("Iniciando a instalação das extensões do Gemini CLI...");
            console.log("Tentando automatizar a confirmação de instalação. Se for solicitada uma confirmação manual, por favor, digite 'Y'.");
            for (const ext of EXTENSION_REPOS) {
                console.log(`\nInstalando a extensão '${ext.name}' de: ${ext.url}`);
                runCommand(`gemini extensions install ${ext.url}`);
            }
            console.log("\nInstalação de extensões concluída!\\n");
            console.log("Para que as extensões sejam totalmente reconhecidas, você pode precisar reiniciar o Gemini CLI.");
            break;
        default:
            console.error(`Erro: Comando desconhecido: ${command}`);
            printUsage();
            break;
    }
}

main();

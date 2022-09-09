import { isErrorCodeException } from 'common-utils/index.js';
import { FileSystemError, Uri, workspace } from 'vscode';

const fs = workspace.fs;

const FileNotFoundErrorCodes: Record<string, undefined | true> = {
    FileNotFound: true,
    EntryNotFound: true,
    ENOENT: true,
};

const fsCode = FileSystemError.FileNotFound().code;
FileNotFoundErrorCodes[fsCode] = true;

interface VSCodeFs {
    createDirectory(uri: Uri): Promise<void>;
    writeFile(uri: Uri, content: string, encoding?: 'utf8'): Promise<void>;
    readFile(uri: Uri, encoding: 'utf8'): Promise<string>;
    fileExists(uri: Uri): Promise<boolean>;
    isFileNotFoundError(e: unknown): boolean;
}

async function createDirectory(uri: Uri): Promise<void> {
    return await fs.createDirectory(uri);
}

async function writeFile(uri: Uri, content: string, encoding = 'utf8' as const): Promise<void> {
    return await fs.writeFile(uri, Buffer.from(content, encoding));
}

async function readFile(uri: Uri, encoding: 'utf8'): Promise<string> {
    return Buffer.from(await fs.readFile(uri)).toString(encoding);
}

async function fileExists(file: Uri): Promise<boolean> {
    try {
        const result = await workspace.fs.stat(file);
        return !!result.type;
    } catch (e) {
        if (!(e instanceof FileSystemError)) throw e;
        return false;
    }
}

function isFileNotFoundError(e: unknown): boolean {
    if (!isErrorCodeException(e)) return false;
    return e.code in FileNotFoundErrorCodes;
}

export const vscodeFs: VSCodeFs = {
    createDirectory,
    writeFile,
    readFile,
    fileExists,
    isFileNotFoundError,
};

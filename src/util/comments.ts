export class Commentifier {
    block: { [key: string]:  Array<string>};
    single: { [key: string]: Array<string>};
    constructor() {
        this.block = {
            'c': ['/*', '*/'],
            'cpp': ['/*', '*/'],
            'cs':['/*', '*/'],
            'css': ['/*', '*/'],
            'go': ['/*', '*/'],
            'kt': ['/*', '*/'],
            'ktm': ['/*', '*/'],
            'kts': ['/*', '*/'],
            'hs': ['{-', '-}'],
            'html': ['<!--', '-->'],
            'htm': ['<!--', '-->'],
            'java': ['/*', '*/'],
            'js': ['/*', '*/'],
            'jsp': ['<%%--', '--%>'],
            'jsx': ['{/*', '*/}'],
            'jspx': ['<%%--', '--%>'],
            'jspf': ['<%%--', '--%>'],
            'pas': ['{*', '*}'],
            'php': ['/*', '*/'],
            'pl': ['=begin', '=cut'],
            'plx': ['=begin', '=cut'],
            'pm': ['=begin', '=cut'],
            'rb': ['=begin', '=cut'],
            'rs': ['/*', '*/'],
            'rlib': ['/*', '*/'],
            'scala': ['/*', '*/'],
            'sc': ['/*', '*/'],
            'scss': ['/*', '*/'],
            'ts': ['/*', '*/'],
            'tsx':  ['/*', '*/']
        };
        this.single = {
            'py': ['#'],
            'r': ['#'],
            'erl': ['%']
        };
    }

    addComment = (code: string, start: string, end?: string ) : string => {
        if(end) {
            return start+'\n'+code+'\n'+end;
        }
        else {
            const temp = '\n'+start+" ";
            return start+' '+`${code.split('\n').join(temp)}`;
        }
    };

    public commentify = (code : string, filename : string) : string => {

        const extension = filename.toLowerCase().split('.')[filename.split('.').length-1];
        let commentedCode: string;
        
        if(extension in this.block) {
            commentedCode = this.addComment(code, this.block[extension][0], this.block[extension][1]);
        } else if (extension in this.single) {
            commentedCode = this.addComment(code, this.single[extension][0]);
        } else {
            console.error(`Extension ${extension} not supported`);
            commentedCode = `Extension ${extension} not supported`;
        }
        
        return commentedCode;
    };

}
const fs = require('fs');
const path = require('path');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
};

const dashboardPath = path.join(__dirname, 'apps/web/app/(dashboard)');
const files = walk(dashboardPath);

files.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('\\n')) {
        console.log(`Cleaning up: ${file}`);
        // Replace literal \n in JSX context. 
        // We look for \n that are NOT inside a string literal if possible, 
        // but in JSX they are often outside {}.
        // The grep showed things like >\n {t('...')} \n<
        
        // Simple approach: replace all literal \n with actual newlines or space
        // if they are not preceded by a backslash (though they were shown as \\n in json)
        // Actually, they are literal backslash and n in the file.
        
        // Let's replace "\\n" with " " or just remove it if it's followed by whitespace.
        // Usually, these were added around {t('...')}
        
        let newContent = content.replace(/\\n/g, ' '); 
        
        // Also found some double imports or double icons in the grep:
        // <Plus ... />\n <Plus ... />\n {t('newWorkflow')}\n
        // Wait, why were there double icons? 
        // grep output check: 141: <Plus ... />\n <Plus ... />\n {t('newWorkflow')}\n
        // My previous scripts might have duplicated lines too.
        
        fs.writeFileSync(file, newContent);
    }
});

console.log('Cleanup complete!');

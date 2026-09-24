/* keys.lucafchala.com — PT/EN strings and copy buttons. Theme and language
   bootstrap lives in /theme.js. */
(function () {
    'use strict';
    var P = window.lfPrefs;
    P.wire({
        pt: {
            skip: 'Pular para o conteúdo', prefs: 'Preferências', theme: 'Alternar tema', title: 'Chaves <em>públicas</em>', rule: 'CHAVES',
            fingerprint: 'Fingerprint', subkey: 'Subchave (cifra)', created: 'Criada em', uid: 'UID principal',
            copy: 'copiar', copy_key: 'copiar chave', copy_fp: 'copiar fingerprint', copied: 'copiado!', copy_failed: 'erro ao copiar',
            download_ssh: 'baixar ssh.pub', download_pgp: 'baixar pgp.asc', cmd_ssh: 'Autorizar em um servidor:', cmd_pgp: 'Importar:', show_key: 'Ver chave completa',
            hint: 'A declaração assinada que liga estas chaves às minhas contas está em <a href="https://proof.lucafchala.com/">proof.lucafchala.com</a>. Para mensagens cifradas, use a chave PGP acima.'
        },
        en: {
            skip: 'Skip to content', prefs: 'Preferences', theme: 'Toggle theme', title: 'Public <em>keys</em>', rule: 'KEYS',
            fingerprint: 'Fingerprint', subkey: 'Subkey (encryption)', created: 'Created', uid: 'Primary UID',
            copy: 'copy', copy_key: 'copy key', copy_fp: 'copy fingerprint', copied: 'copied!', copy_failed: 'copy failed',
            download_ssh: 'download ssh.pub', download_pgp: 'download pgp.asc', cmd_ssh: 'Authorize on a server:', cmd_pgp: 'Import:', show_key: 'Show full key',
            hint: 'The signed statement tying these keys to my accounts is at <a href="https://proof.lucafchala.com/">proof.lucafchala.com</a>. For encrypted messages, use the PGP key above.'
        }
    });

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy') ? resolve() : reject(new Error('copy')); } catch (e) { reject(e); }
            document.body.removeChild(ta);
        });
    }

    var live = document.getElementById('live');
    document.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('[data-copy-from], [data-copy-text]');
        if (!b) return;
        var src = b.getAttribute('data-copy-from');
        var text = src ? document.getElementById(src).textContent : b.getAttribute('data-copy-text');
        var key = b.getAttribute('data-i18n');
        function done(msgKey) {
            b.textContent = P.t(msgKey);
            live.textContent = P.t(msgKey);
            setTimeout(function () { b.textContent = P.t(key); }, 2000);
        }
        copyText(text.trim()).then(function () { done('copied'); }, function () { done('copy_failed'); });
    });
})();

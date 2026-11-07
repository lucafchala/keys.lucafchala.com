// Aviso de lançamento de álbum do fotos, posto no HTML pelo servidor (sem
// script na página). Só roda na página inicial: ver _routes.json. A lógica
// está em _lib/destaque-servidor.js, cópia igual nos outros sites que usam
// esta versão — ver o docs/ALBUM.md do fotos.
import { comDestaque } from './_lib/destaque-servidor.js';

export const onRequest = (context) => comDestaque(context.request, (req) => context.next(req), (p) => context.waitUntil(p));

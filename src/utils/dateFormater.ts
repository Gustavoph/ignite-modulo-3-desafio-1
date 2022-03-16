import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function dateFormater(date: Date | string, typeFormat?: number): string {
  if (typeFormat === 1) {
    const data = format(new Date(date), 'dd LLL YYY', {
      locale: ptBR,
    });
    const hora = format(new Date(date), 'HH:mm', {
      locale: ptBR,
    });

    return `${data} às ${hora}`;
  }

  return format(new Date(date), 'dd LLL YYY', {
    locale: ptBR,
  });
}

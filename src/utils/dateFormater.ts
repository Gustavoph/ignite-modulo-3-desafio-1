import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function dateFormater(date: Date | string): string {
  return format(new Date(date), 'dd LLL YYY', {
    locale: ptBR,
  });
}

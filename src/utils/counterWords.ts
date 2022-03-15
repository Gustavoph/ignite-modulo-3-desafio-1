/* eslint-disable no-shadow */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
interface CounterWordsProps {
  content: {
    heading: string;
    body: {
      text: string;
    }[];
  }[];
}

export function counterWords({ content }: CounterWordsProps): number {
  const countWords = content.reduce((total, content) => {
    const words = content.body.map(
      paragraph => paragraph.text.split(' ').length
    );
    words.map(word => (total += word));
    return total;
  }, 0);

  return Math.ceil(countWords / 200);
}

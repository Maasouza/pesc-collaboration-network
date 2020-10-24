import * as d3 from 'd3';

const categoricalColors = d3.scaleOrdinal(d3.schemeCategory10);

const colors = {
  'Redes de Computadores': categoricalColors(1),
  'Otimização': categoricalColors(2),
  'Engenharia de Dados e Conhecimento': categoricalColors(3),
  'Engenharia de Software': categoricalColors(4),
  'Computação Gráfica': categoricalColors(5),
  'Inteligência Artificial': categoricalColors(6),
  'Algoritmos e Combinatória': categoricalColors(7),
  'Arquitetura e Sistemas Operacionais': categoricalColors(8),
  'Informática e Sociedade': categoricalColors(9),
};

export default colors;

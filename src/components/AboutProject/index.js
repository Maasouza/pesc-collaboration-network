import React, { useState } from 'react';

import { BsInfoCircle } from 'react-icons/bs';
import { IoLogoGithub } from 'react-icons/io';

import './styles.css';

const AboutProject = () => {
  const [openned, setOpenned] = useState(false);

  return (
    <div className="about-container">
      <div className="about-button" onClick={() => setOpenned(!openned)}>
        <BsInfoCircle size={18} />
        sobre
      </div>
      <div className={openned ? 'about-content openned' : 'about-content'}>
        <p className="about-title">Rede de Colaboração Acadêmica do PESC</p>
        <p>
          Lista parcial de docentes que atuaram no PESC nos últimos 50 anos.
        </p>
        <p>Dados coletados diretamente do CV Lattes de cada docente.</p>
        <p>
          Arestas representam colaboração acadêmica entre docentes (artigo
          científico, capítulo de livro, e orientação de mestrado ou doutorado).
        </p>
        <p>Programação visual: Rafael Damasceno.</p>
        <p>
          Coleta e processamento dos dados: Pedro Cavaliere e Rodrigo Palmeira.
        </p>
        <p>Coordenação: Daniel Ratton Figueiredo.</p>
        <a
          className="github-button"
          href="https://github.com/DamascenoRafael/pesc-collaboration-network"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IoLogoGithub size={18} />
          Ver no GitHub
        </a>
      </div>
    </div>
  );
};

export default AboutProject;

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeFooterComponent } from '../home/home-footer.component';

@Component({
  selector: 'app-sobre',
  imports: [RouterLink, HomeFooterComponent],
  templateUrl: './sobre.component.html',
  styleUrl: './sobre.component.css',
})
export class SobreComponent {
  // Adicione aqui as fotos, os resumos e as URLs públicas do LinkedIn de cada integrante.
  readonly team: { name: string; initials: string; photo: string | null; summary: string; linkedin: string | null; role?: string }[] = [
    {
      name: 'Ana Julia Berzin',
      role: 'Líder da equipe · Desenvolvedora Full Stack',
      initials: 'AJ',
      photo: 'images/team/ana-julia-berzin.png',
      summary: 'Estudante de Análise e Desenvolvimento de Sistemas na FACENS e desenvolvedora Full Stack com Python (Django), React e Flutter. Atua com APIs REST, integrações, bancos de dados e testes automatizados, colaborando com equipes e clientes para transformar necessidades em soluções. Utiliza IA e LLMs como apoio ao desenvolvimento.',
      linkedin: 'https://www.linkedin.com/in/anaberzin/',
    },
    { name: 'Eros Henrique', initials: 'EH', photo: null, summary: '', linkedin: null },
    { name: 'Luiz Henrique', initials: 'LH', photo: null, summary: '', linkedin: null },
    { name: 'Kauan', initials: 'K', photo: null, summary: '', linkedin: null },
  ];
}

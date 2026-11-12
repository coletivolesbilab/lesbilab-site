import Link from 'next/link';
import Image from 'next/image';

const FORMS = 'https://forms.gle/KBYF6QJyaCpgzQuUA';

// Próximos eventos: edite aqui (data, nome).
const INSTA = 'https://www.instagram.com/lesbilab/';
const EVENTOS = [
  { data: '27/11', nome: 'Cinema LESBILAB', info: 'Ingressos pelo direct: chama a gente na DM do @lesbilab.', dm: true },
  { data: '11/12', nome: 'Roda de Samba', info: 'Informações em breve.', dm: false },
];

const EIXOS = [
  { t: 'Workshops e formação', c: 'bg-papel', p: ['Criamos espaços de aprendizado, troca e desenvolvimento. Por meio de workshops e atividades formativas, queremos compartilhar conhecimentos, incentivar novas habilidades e aproximar profissionais e pessoas interessadas em aprender.', 'Acreditamos que conhecimento também é uma ferramenta de autonomia e transformação.'] },
  { t: 'Debates e conversas', c: 'bg-amarelo', p: ['Promovemos encontros para discutir assuntos que atravessam nossas vivências, compartilhar experiências e ampliar perspectivas.', 'São espaços de escuta, reflexão e construção coletiva, onde diferentes histórias e opiniões podem se encontrar.'] },
  { t: 'Rolês, festas e encontros', c: 'bg-magenta text-papel', p: ['Acreditamos que ocupar espaços também é celebrar.', 'Criamos festas, eventos e encontros para que pessoas sáficas possam se conhecer, se divertir, trocar experiências e viver momentos de liberdade e pertencimento.', 'Queremos mais espaços onde possamos ser quem somos, sem precisar explicar ou justificar nossa existência.'] },
  { t: 'Rede de talentos e oportunidades', c: 'bg-roxo text-papel', p: ['Uma das nossas principais iniciativas é o Banco de Talentos LESBILAB, uma plataforma nacional para dar visibilidade a profissionais da comunidade sáfica.', 'Queremos facilitar conexões entre profissionais, empresas, marcas e pessoas que procuram serviços, fazendo com que oportunidades circulem dentro da nossa própria rede.', 'Valorizar o trabalho umas das outras também é uma forma de fortalecimento coletivo.'], link: true },
];

export default function OColetivo() {
  return (
    <div className="bg-verde">
      <div className="wrap grid gap-8 py-10 max-w-5xl">
        <Image src="/logo-h-original.webp" alt="Coletivo LESBILAB" width={700} height={294} priority className="w-64 md:w-80 h-auto" />
        <span className="tarja justify-self-start">O Coletivo LESBILAB</span>
        <h1 className="font-display uppercase text-[clamp(34px,6vw,66px)] leading-[1.18] text-balance">Ocupar espaços, criar conexões e fortalecer umas às outras.</h1>

        <section className="bg-roxo text-papel p-6 grid gap-4">
          <h2 className="font-display uppercase text-3xl md:text-4xl leading-[1.2]">Próximos eventos do coletivo</h2>
          <ul className="grid gap-3">
            {EVENTOS.map((e) => (
              <li key={e.data + e.nome} className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <span className="font-display text-4xl md:text-5xl text-amarelo leading-[1.1]">{e.data}</span>
                <span className="grid gap-1">
                  <span className="font-display uppercase text-2xl md:text-3xl leading-[1.2]">{e.nome}</span>
                  <span className="text-sm md:text-base opacity-90">
                    {e.info}{e.dm && <> <a href={INSTA} target="_blank" rel="noopener noreferrer" className="underline text-verde">Abrir o Instagram</a></>}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <a href={INSTA} target="_blank" rel="noopener noreferrer" className="justify-self-start text-sm font-medium border-2 border-papel px-3 py-1.5 hover:bg-papel hover:text-roxo">Siga @lesbilab no Instagram</a>
        </section>

        <section className="grid gap-3 max-w-prose text-[17px]">
          <h2 className="font-display uppercase text-3xl md:text-4xl leading-[1.2]">O que é o LESBILAB?</h2>
          <p>O LESBILAB é um coletivo sáfico criado para conectar pessoas, construir oportunidades e fortalecer a presença da nossa comunidade nos mais diferentes espaços.</p>
          <p>Acreditamos na potência de estarmos juntas, de compartilhar conhecimentos, criar redes de apoio e abrir caminhos para que mais mulheres e pessoas sáficas ocupem lugares que também são nossos.</p>
          <p>Mais do que promover encontros, queremos construir uma rede onde talentos sejam reconhecidos, ideias ganhem espaço, oportunidades circulem e ninguém precise fazer tudo sozinha.</p>
        </section>

        <div className="grid gap-3 md:grid-cols-2">
          {EIXOS.map((e) => (
            <section key={e.t} className={`${e.c} border-2 border-roxo p-5 grid gap-2 content-start`}>
              <h3 className="font-display uppercase text-2xl leading-[1.25]">{e.t}</h3>
              {e.p.map((t) => <p key={t}>{t}</p>)}
              {e.link && <Link href="/talentos" className="btn justify-self-start mt-2 !bg-amarelo !text-roxo !shadow-none">Ver o Banco de Talentos</Link>}
            </section>
          ))}
        </div>

        <section className="grid gap-3 max-w-prose text-[17px]">
          <h2 className="font-display uppercase text-3xl md:text-4xl leading-[1.2]">Ocupar espaços, abrir caminhos</h2>
          <p>Acreditamos que não basta conquistar espaços individualmente. Queremos que outras também possam chegar.</p>
          <p>Fortalecer umas às outras significa indicar, contratar, divulgar, ensinar, aprender, apoiar projetos e reconhecer o trabalho de quem faz parte da nossa comunidade.</p>
          <p>Quando uma de nós ocupa um espaço, queremos que outras encontrem caminhos para ocupar também.</p>
          <p>O LESBILAB é sobre criar possibilidades juntas. Sobre transformar encontros em conexões e conexões em oportunidades.</p>
        </section>

        <p className="bg-roxo p-5 font-display uppercase text-[clamp(24px,4vw,38px)] leading-[1.22] grid">
          <span className="text-magenta">Porque juntas</span><span className="text-amarelo">podemos chegar</span><span className="text-verde">mais longe.</span>
        </p>

        <section className="bg-magenta text-papel p-6 grid gap-3">
          <h2 className="font-display uppercase text-3xl md:text-4xl leading-[1.2]">Faça parte dessa rede</h2>
          <p className="max-w-prose text-[17px]">Você é uma profissional sáfica e quer fazer parte do nosso Banco de Talentos? Cadastre suas informações pelo nosso formulário e ajude a fortalecer essa rede.</p>
          <a href={FORMS} target="_blank" rel="noopener noreferrer" className="btn justify-self-start !bg-amarelo !text-roxo">Quero fazer parte do Banco de Talentos</a>
        </section>
      </div>
    </div>
  );
}

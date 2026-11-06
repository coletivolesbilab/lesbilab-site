-- LESBILAB Banco de Talentos — rode inteiro no SQL Editor do Supabase.
create extension if not exists unaccent;

create table estados (uf char(2) primary key, nome text not null);
insert into estados values
('AC','Acre'),('AL','Alagoas'),('AP','Amapá'),('AM','Amazonas'),('BA','Bahia'),('CE','Ceará'),('DF','Distrito Federal'),
('ES','Espírito Santo'),('GO','Goiás'),('MA','Maranhão'),('MT','Mato Grosso'),('MS','Mato Grosso do Sul'),('MG','Minas Gerais'),
('PA','Pará'),('PB','Paraíba'),('PR','Paraná'),('PE','Pernambuco'),('PI','Piauí'),('RJ','Rio de Janeiro'),('RN','Rio Grande do Norte'),
('RS','Rio Grande do Sul'),('RO','Rondônia'),('RR','Roraima'),('SC','Santa Catarina'),('SP','São Paulo'),('SE','Sergipe'),('TO','Tocantins');

create table cidades (
  id bigint generated always as identity primary key,
  uf char(2) not null references estados(uf),
  nome text not null,
  slug text not null,
  unique (uf, slug)
);

create table categorias (
  id bigint generated always as identity primary key,
  nome text not null unique,
  slug text not null unique,
  ordem int not null default 0
);
insert into categorias (nome, slug, ordem) values
('Artes Visuais','artes-visuais',1),('Audiovisual','audiovisual',2),('Bares','bares',3),('Bem-estar & Cuidado','bem-estar-cuidado',4),
('Comidinhas & bebidinhas','comidinhas-bebidinhas',5),('Comunicação & Conteúdo','comunicacao-conteudo',6),('Educação & Facilitação','educacao-facilitacao',7),
('Empreendedorismo & Marcas Independentes','empreendedorismo-marcas',8),('Escrita & Pesquisa','escrita-pesquisa',9),('Estética & Beleza','estetica-beleza',10),
('Fotografia','fotografia',11),('Moda & Estilo','moda-estilo',12),('Música','musica',13),('Performance & Artes Cênicas','performance-artes-cenicas',14),
('Política','politica',15),('Produção Cultural & Eventos','producao-cultural-eventos',16),('Saúde mental','saude-mental',17),
('Tecnologia & Digital','tecnologia-digital',18),('Outros','outros',99);

create type status_perfil as enum ('rascunho','publicado','suspenso');

create table profissionais (
  id bigint generated always as identity primary key,
  slug text not null unique,
  nome text not null,
  profissao text not null default '',
  descricao text,
  cidade_id bigint references cidades(id) on delete set null,
  uf char(2) references estados(uf),
  telefone text,
  instagram text,
  outras_redes text,           -- uma por linha (URLs)
  site text,
  sexualidade text,
  mostrar_sexualidade boolean not null default true,
  autoriza_contato boolean not null default true,
  status status_perfil not null default 'rascunho',
  destaque boolean not null default false,
  revisar boolean not null default false,
  local_original text,         -- texto como veio da planilha
  categoria_original text,     -- texto de categoria que não bateu com a lista
  origem text not null default 'manual',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index on profissionais (status);
create index on profissionais (uf);

create table profissional_categorias (
  profissional_id bigint references profissionais(id) on delete cascade,
  categoria_id bigint references categorias(id) on delete cascade,
  primary key (profissional_id, categoria_id)
);

create table admins (user_id uuid primary key references auth.users(id) on delete cascade);

create function is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from admins where user_id = auth.uid()) $$;

-- RLS: tabelas só para a equipe. O público lê pela view abaixo.
alter table estados enable row level security;
alter table cidades enable row level security;
alter table categorias enable row level security;
alter table profissionais enable row level security;
alter table profissional_categorias enable row level security;
alter table admins enable row level security;

create policy leitura_publica on estados for select using (true);
create policy leitura_publica on categorias for select using (true);
create policy leitura_publica on cidades for select using (true);
create policy admin_tudo on cidades for all using (is_admin()) with check (is_admin());
create policy admin_tudo on categorias for all using (is_admin()) with check (is_admin());
create policy admin_tudo on profissionais for all using (is_admin()) with check (is_admin());
create policy admin_tudo on profissional_categorias for all using (is_admin()) with check (is_admin());
create policy admin_le on admins for select using (user_id = auth.uid());

-- View pública: só perfis publicados; contato e sexualidade só quando permitidos.
create view perfis_publicos as
select p.id, p.slug, p.nome, p.profissao, p.descricao, p.uf, e.nome as estado,
       c.nome as cidade, c.slug as cidade_slug, p.destaque,
       case when p.autoriza_contato then p.telefone end as telefone,
       case when p.autoriza_contato then p.instagram end as instagram,
       case when p.autoriza_contato then p.outras_redes end as outras_redes,
       case when p.autoriza_contato then p.site end as site,
       case when p.mostrar_sexualidade then p.sexualidade end as sexualidade,
       coalesce(array(select categoria_id from profissional_categorias pc where pc.profissional_id = p.id), '{}') as categoria_ids,
       lower(unaccent(p.nome || ' ' || p.profissao || ' ' || coalesce(c.nome,''))) as busca
from profissionais p
left join cidades c on c.id = p.cidade_id
left join estados e on e.uf = p.uf
where p.status = 'publicado';
grant select on perfis_publicos to anon, authenticated;

-- Depois de criar sua usuária em Authentication > Users, libere o acesso ao painel:
-- insert into admins (user_id) select id from auth.users where email = 'email@da-equipe.com';

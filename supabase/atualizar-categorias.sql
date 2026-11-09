-- Atualiza as categorias do site (30 categorias, sem "Outros"). Pode rodar mais de uma vez.
update categorias set nome = 'Artes Visuais & Artesanato', slug = 'artes-visuais-artesanato' where slug in ('artes-visuais', 'artes-visuais-design-artesanato');

insert into categorias (nome, slug, ordem) values
('Administração, Finanças & Negócios','administracao-financas-negocios',1),
('Arquitetura, Engenharia & Obras','arquitetura-engenharia-obras',2),
('Artes Visuais & Artesanato','artes-visuais-artesanato',3),
('Audiovisual','audiovisual',4),
('Bares','bares',5),
('Bartender','bartender',6),
('Bem-estar & Cuidado','bem-estar-cuidado',7),
('Ciências & Meio Ambiente','ciencias-meio-ambiente',8),
('Comidinhas & bebidinhas','comidinhas-bebidinhas',9),
('Comunicação & Conteúdo','comunicacao-conteudo',10),
('Design','design',11),
('Direito & Jurídico','direito-juridico',12),
('Educação & Facilitação','educacao-facilitacao',13),
('Empreendedorismo & Marcas Independentes','empreendedorismo-marcas',14),
('Escrita & Pesquisa','escrita-pesquisa',15),
('Espiritualidade & Terapias Holísticas','espiritualidade-terapias-holisticas',16),
('Esporte & Atividade Física','esporte-atividade-fisica',17),
('Estética & Beleza','estetica-beleza',18),
('Fotografia','fotografia',19),
('Manutenção, Reparos & Serviços','manutencao-reparos-servicos',20),
('Moda & Estilo','moda-estilo',21),
('Música','musica',22),
('Performance & Artes Cênicas','performance-artes-cenicas',23),
('Pets & Animais','pets-animais',24),
('Política','politica',25),
('Produção Cultural & Eventos','producao-cultural-eventos',26),
('Saúde','saude',27),
('Saúde mental','saude-mental',28),
('Serviço Social','servico-social',29),
('Tecnologia & Digital','tecnologia-digital',30)
on conflict (slug) do update set nome = excluded.nome, ordem = excluded.ordem;

-- Quem estava em "Outros" fica marcado para revisão; "Outros" sai da lista
update profissionais set revisar = true
where id in (select pc.profissional_id from profissional_categorias pc join categorias c on c.id = pc.categoria_id where c.slug = 'outros');
delete from categorias where slug = 'outros';

-- Bartenders saem de "Bares" e vão para "Bartender"
insert into profissional_categorias (profissional_id, categoria_id)
select p.id, (select id from categorias where slug = 'bartender') from profissionais p
where unaccent(lower(p.profissao)) ~ '(bartender|barman|barwoman|barista|mixolog|coquetel|drinks)'
on conflict do nothing;
delete from profissional_categorias
where categoria_id = (select id from categorias where slug = 'bares')
  and profissional_id in (select id from profissionais where unaccent(lower(profissao)) ~ '(bartender|barman|barwoman|barista|mixolog|coquetel|drinks)');

-- Designers ganham a categoria "Design" (design de sobrancelha e de interiores ficam de fora)
insert into profissional_categorias (profissional_id, categoria_id)
select p.id, (select id from categorias where slug = 'design') from profissionais p
where unaccent(lower(p.profissao)) ~ '(designer|design grafic|design de (marca|produto|moda)|\mux\M|\mui\M|motion|branding|identidade visual)' and unaccent(lower(p.profissao)) !~ '(sobrancelh|interiores)'
on conflict do nothing;

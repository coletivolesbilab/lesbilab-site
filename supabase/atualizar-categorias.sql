-- Atualiza categorias (nov/2026). Rode uma vez no SQL Editor do Supabase.
-- 1. Renomeia Artes Visuais
update categorias set nome = 'Artes Visuais, Design & Artesanato', slug = 'artes-visuais-design-artesanato' where slug = 'artes-visuais';

-- 2. Categorias novas
insert into categorias (nome, slug, ordem) values
('Administração, Finanças & Negócios','administracao-financas-negocios',0),
('Arquitetura, Engenharia & Obras','arquitetura-engenharia-obras',0),
('Ciências & Meio Ambiente','ciencias-meio-ambiente',0),
('Direito & Jurídico','direito-juridico',0),
('Espiritualidade & Terapias Holísticas','espiritualidade-terapias-holisticas',0),
('Esporte & Atividade Física','esporte-atividade-fisica',0),
('Manutenção, Reparos & Serviços','manutencao-reparos-servicos',0),
('Pets & Animais','pets-animais',0),
('Saúde','saude',0),
('Serviço Social','servico-social',0)
on conflict (slug) do nothing;

-- 3. Quem estava em "Outros" fica marcado para revisão; depois apaga "Outros"
update profissionais set revisar = true
where id in (select pc.profissional_id from profissional_categorias pc join categorias c on c.id = pc.categoria_id where c.slug = 'outros');
delete from categorias where slug = 'outros';

-- 4. Ordem alfabética
update categorias set ordem = 1 where slug = 'administracao-financas-negocios';
update categorias set ordem = 2 where slug = 'arquitetura-engenharia-obras';
update categorias set ordem = 3 where slug = 'artes-visuais-design-artesanato';
update categorias set ordem = 4 where slug = 'audiovisual';
update categorias set ordem = 5 where slug = 'bares';
update categorias set ordem = 6 where slug = 'bem-estar-cuidado';
update categorias set ordem = 7 where slug = 'ciencias-meio-ambiente';
update categorias set ordem = 8 where slug = 'comidinhas-bebidinhas';
update categorias set ordem = 9 where slug = 'comunicacao-conteudo';
update categorias set ordem = 10 where slug = 'direito-juridico';
update categorias set ordem = 11 where slug = 'educacao-facilitacao';
update categorias set ordem = 12 where slug = 'empreendedorismo-marcas';
update categorias set ordem = 13 where slug = 'escrita-pesquisa';
update categorias set ordem = 14 where slug = 'espiritualidade-terapias-holisticas';
update categorias set ordem = 15 where slug = 'esporte-atividade-fisica';
update categorias set ordem = 16 where slug = 'estetica-beleza';
update categorias set ordem = 17 where slug = 'fotografia';
update categorias set ordem = 18 where slug = 'manutencao-reparos-servicos';
update categorias set ordem = 19 where slug = 'moda-estilo';
update categorias set ordem = 20 where slug = 'musica';
update categorias set ordem = 21 where slug = 'performance-artes-cenicas';
update categorias set ordem = 22 where slug = 'pets-animais';
update categorias set ordem = 23 where slug = 'politica';
update categorias set ordem = 24 where slug = 'producao-cultural-eventos';
update categorias set ordem = 25 where slug = 'saude';
update categorias set ordem = 26 where slug = 'saude-mental';
update categorias set ordem = 27 where slug = 'servico-social';
update categorias set ordem = 28 where slug = 'tecnologia-digital';

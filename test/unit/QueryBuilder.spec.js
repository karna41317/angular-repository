describe('QueryBuilder', function() {
	beforeEach(module('repository'));

	describe('::create()', function() {
		it('should return a instance of QueryBuilder', inject(function(QueryBuilder) {
			expect(QueryBuilder.create() instanceof QueryBuilder).toBe(true);
		}));
	});

	describe('#from(String repository)', function() {
		it('should select a repository where the query will be executed', inject(function(QueryBuilder) {
			var qb = new QueryBuilder();
			qb.from('FooRepository');
			expect(qb.$$repository).toBe('FooRepository');
		}));
	});

	describe('#where(name, operator, value)', function() {
		it('should add a filtering rule', inject(function(QueryBuilder, RepositoryFilter) {
			var qb = new QueryBuilder();
			qb.where('age', QueryBuilder.LT, 20);

			var filter = qb.$$filters.toJSON()[0];
			expect(filter.name).toBe('age');
			expect(filter.operator).toBe(RepositoryFilter.prototype.operators.LT);
			expect(filter.value).toBe(20);
		}));
	});

	describe('#sort(name, direction)', function() {
		it('should add a sorting rule', inject(function(QueryBuilder, RepositorySorting) {
			var qb = new QueryBuilder();
			qb.sort('name', QueryBuilder.DESC);

			var sorting = qb.$$sorting.toJSON()[0];
			expect(sorting.name).toBe('name');
			expect(sorting.direction).toBe(RepositorySorting.prototype.directions.DESC);
		}));
	});

	describe('#limit(Number limit)', function() {
		it('should set the page size and return the instance', inject(function(QueryBuilder) {
			var qb = new QueryBuilder();
			qb.limit(4);
			expect(qb.$$pagination.toJSON().itemsPerPage).toBe(4);
		}));
	});

	describe('#skip(Number skip)', function() {
		it('should set the search offset and return the instance', inject(function(QueryBuilder) {
			var qb = new QueryBuilder();
			qb.limit(5).skip(10);
			expect(qb.$$pagination.toJSON().currentPage).toBe(3);
		}));
	});

	describe('#page(Number page, Number [limit])', function() {
		it('should ', inject(function(QueryBuilder) {
			var qb = new QueryBuilder();
			qb.page(2, 10);

			var params = qb.$$pagination.toJSON();
			expect(params.currentPage).toBe(2);
			expect(params.itemsPerPage).toBe(10);
		}));
	});

	describe('#reset()', function() {
		it('should restore the default values for each subcomponent', inject(function(QueryBuilder) {
			var query = new QueryBuilder();

			spyOn(query.$$filters, 'reset');
			spyOn(query.$$sorting, 'reset');
			spyOn(query.$$pagination, 'reset');

			query.reset();

			expect(query.$$filters.reset).toHaveBeenCalled();
			expect(query.$$sorting.reset).toHaveBeenCalled();
			expect(query.$$pagination.reset).toHaveBeenCalled();
		}));
	});

	describe('#toJSON()', function() {
		it('should return the state in the query builder', inject(function(QueryBuilder) {
			var query = new QueryBuilder();

			var params = query
				.from('User')
				.limit(5)
				.skip(10)
				.where('name', QueryBuilder.LK, 'john')
				.sort('name', QueryBuilder.ASC)
				.toJSON();

			expect(params).toEqual({
				filters: [{
					name: 'name',
					operator: QueryBuilder.LK,
					value: 'john'
				}],
				sorting: [{
					name: 'name',
					direction: QueryBuilder.ASC
				}],
				pagination: {
					currentPage: 3,
					itemsPerPage: 5

					// count was not set on query construction
				}
			});

		}));
	});

	describe('!constant values (operators and sorting directions)', function() {
		it('should expose the filter operators and sorting directions as static values', inject(function(RepositoryFilter, RepositorySorting, QueryBuilder) {
			var operators = RepositoryFilter.prototype.operators,
				directions = RepositorySorting.prototype.directions;

			Object.keys(operators).forEach(function(key) {
				var value = operators[key];
				expect(QueryBuilder[key]).toBe(value);
			});

			Object.keys(directions).forEach(function(key) {
				var value = directions[key];
				expect(QueryBuilder[key]).toBe(value);
			});
		}));
	});
});

function Row() {
	this.key = '';
	this.comparison  = 'none';
	this.value = '';
}
var app = new Vue({
	el: '#app',
	data: {
		rows: [],
		resultingQuery: ''
	},
	methods: {
		addRow: function() {
			this.rows.push( new Row() );
		},
		removeRow: function( row ) {
			this.rows.splice(this.rows.indexOf(row), 1)
			this.queryCalc();
		},
		calcVol: function( row ) {
			row.volume = row.length * row.width * row.height;
			this.updateTotalVol();
		},
		updateQuery: function() {
			this.resultingQuery = this.queryCalc();
		},
		queryCalc: function() {
			var query =  '';
			var index;

			query += "SELECT\n";
			this.rows.forEach( function ( row, index ) {
				if ( 0 !== index ) {
					query += ",\n";
				}
				query += "\tm" + index + ".meta_value AS " + row.key;
			});

			query += "\n";
			query += "FROM wp_postmeta m0";

			this.rows.forEach( function( row, index ) {
				// Skip the first entry.
				if ( 0 === index ) {
					return true;
				}
				query += "\nLEFT JOIN wp_postmeta m" + index + "\n";
				query += "\tON m0.post_id = m" + index + ".post_id AND m" + index + ".meta_key = '" + row.key + "'";
			});

			query += "\n";
			query += "WHERE m0.meta_key = '" + this.rows[0].key + "'";

			this.rows.forEach( function( row, index ) {
				if ( 'none' === row.comparison ) {
					// Skip this iteration.
					return true;
				}
				query += "\n";
				query += "\tAND m" + index + ".`meta_value` " ;

				if ( 'null' === row.comparison ) {
					query += 'IS NULL';
				} else {
					// Use row.comparison as the operator (e.g. =, <>).
					query += row.comparison + " '" + row.value + "'";
				}

				// Add comment with key.
				query += ' -- meta_key: ' + row.key;
			});

			query += ";";



			return query;
		}
	}
});

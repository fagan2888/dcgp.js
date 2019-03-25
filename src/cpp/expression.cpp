#include <emscripten.h>

#include "dcgp/expression.hpp"
#include "dcgp/kernel_set.hpp"


using namespace dcgp;

// expression.cpp
extern "C"
{
  // empty constructor
  expression<double> *EMSCRIPTEN_KEEPALIVE embind_expression_0(const unsigned inputs, const unsigned outputs, const unsigned rows, const unsigned columns, const unsigned levels_back, const unsigned arity, const kernel_set<double> *const kernels, const double seed)
  {
    return new expression<double>(inputs, outputs, rows, columns, levels_back, arity, (*kernels)(), seed);
  }

  // get chromosome
  unsigned int *EMSCRIPTEN_KEEPALIVE embind_expression_get(const expression<double> *const self, unsigned *const length)
  {
    const std::vector<unsigned> tmp_chromosome = self->get();

    *length = tmp_chromosome.size();

    unsigned *chromosome = new unsigned[*length];

    memcpy(chromosome, &tmp_chromosome[0], *length * sizeof(unsigned));

    return chromosome;
  }

  // set chromosome
  void EMSCRIPTEN_KEEPALIVE embind_expression_set(expression<double> *const self, const unsigned *const chromosome, const unsigned length)
  {
    std::vector<unsigned> chromosome_vect(chromosome, chromosome + length);

    self->set(chromosome_vect);
  }

  // compute and return the result of this kernel
  double * EMSCRIPTEN_KEEPALIVE embind_expression_call_double(const expression<double> *const self, const double *const input_numbers, unsigned len, unsigned * const out_len)
  {
    std::vector<double> input_vector(input_numbers, input_numbers + len);

    std::vector<double> results = (*self)(input_vector);

    *out_len = results.size();

    double *outputs = new double[*out_len];
    memcpy(outputs, &results[0], *out_len * sizeof(double));

    return outputs;
  }

  // set the equation in an array
  char *EMSCRIPTEN_KEEPALIVE embind_expression_call_string(const expression<double> *const self, const char *const input_chars, const unsigned *const lengths, unsigned len, unsigned *const out_length)
  {
    std::vector<std::string> input_strings;
    input_strings.reserve(len);

    {
      unsigned shifted(0);

      for (size_t i = 0; i < len; i++)
      {
        const char *string_start = input_chars + shifted;
        const char *string_end = input_chars + shifted + lengths[i];

        input_strings.emplace_back(string_start, string_end);

        shifted += lengths[i];
        shifted++;
      }
    }

    std::vector<std::string> tmp_result = (*self)(input_strings);

    unsigned len_results = tmp_result.size();
    unsigned total_length(len_results);

    for (size_t i = 0; i < len_results; i++)
    {
      total_length += tmp_result[i].length();
    }

    char *result = new char[total_length];
    *out_length = total_length;

    unsigned shift(0);
    for (size_t i = 0; i < len_results; i++)
    {
      strcpy(&result[shift + i], tmp_result[i].c_str());
      shift += tmp_result[i].length();
    }

    return result;
  }

  // destroy
  void EMSCRIPTEN_KEEPALIVE
  embind_expression_destroy(const expression<double> *const self)
  {
    delete self;
  }
}
